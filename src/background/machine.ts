import {
  createMachine,
  assign,
  MachineConfig,
  DoneInvokeEvent,
  TransitionConfig,
  BaseActionObject,
  StatesConfig,
  StateSchema,
  AssignAction,
  InvokeCreator,
  EventObject,
} from 'xstate';

import { DEFAULT_CONTEXT } from '../common/context';
import { EVENTS } from './events';

import {
  BackgroundMachineContext,
  BackgroundMachineEvent,
  ClickEvent,
  ContextMenuEvent,
  EventOnCompleteData,
} from '../common/types';
import { updateTabVisits } from './assigners';

const invokeWrapper = async <T, V>(
  func: (context: BackgroundMachineContext, arg?: V) => Promise<T>,
  def: T,
  context: BackgroundMachineContext,
  args?: V,
) => {
  if (context.retries < 2) {
    return func(context, args);
  }
  return def;
};

const promiseServiceStates = <T, V extends EventObject>(
  id: string,
  src: InvokeCreator<BackgroundMachineContext, V>,
  onComplete?: AssignAction<BackgroundMachineContext, DoneInvokeEvent<T>>,
) => ({
  initial: 'running',
  states: {
    running: {
      invoke: {
        id,
        src,
        onDone: {
          target: 'done',
          actions: onComplete,
        },
        onError: {
          target: 'error',
        },
      },
    },
    error: {
      always: [
        {
          target: 'running',
          actions: assign({
            retries: ({ retries }) => retries + 1,
          }),
        },
      ],
    },
    done: {
      type: 'final',
    },
  },
  onDone: 'idle',
});

const CLICK_EVENTS = EVENTS.filter(({ scope }) => scope === 'click');

const contextMenuTransitions = CLICK_EVENTS.map(
  (event) =>
    ({
      target: event.target,
      cond: (
        ...args: [object, object, { state: { event: ContextMenuEvent } }]
      ) => {
        const [, , meta] = args;
        return `${meta.state.event.info.menuItemId}`.endsWith(event.id);
      },
    } as TransitionConfig<BackgroundMachineContext, BackgroundMachineEvent>),
);

const clickActionTransitions = CLICK_EVENTS.map(
  (event) =>
    ({
      target: event.target,
      cond: (context: BackgroundMachineContext) =>
        context.settings?.defaultClickAction === event.id,
    } as TransitionConfig<BackgroundMachineContext, BackgroundMachineEvent>),
);

const clickEventStates = CLICK_EVENTS.reduce(
  (stateObject, event) => ({
    ...stateObject,
    [event.target]: promiseServiceStates<EventOnCompleteData, ClickEvent>(
      event.id,
      (context: BackgroundMachineContext, invokeObject?: ClickEvent) =>
        invokeWrapper(
          event.invoke,
          { tabs: [], groups: [] },
          context,
          invokeObject,
        ),
      event.mutate,
    ),
  }),
  {} as StatesConfig<
    BackgroundMachineContext,
    StateSchema<BackgroundMachineContext>,
    BackgroundMachineEvent,
    BaseActionObject
  >,
);

const BackgroundMachineConfig: MachineConfig<
  BackgroundMachineContext,
  StateSchema<BackgroundMachineContext> & {
    states: {
      idle: Record<string, unknown>;
    };
  },
  BackgroundMachineEvent
> = {
  id: 'background',
  context: DEFAULT_CONTEXT,
  initial: 'idle',
  states: {
    ...clickEventStates,
    idle: {
      on: {
        CONTEXT_MENU: 'contextMenu',
        CLICK_ACTION: 'clickAction',
        VISIT_TAB: 'visitTab',
      },
      entry: assign({ retries: 0 }),
    },
    contextMenu: {
      always: contextMenuTransitions,
    },
    clickAction: {
      always: clickActionTransitions,
    },
    visitTab: {
      entry: updateTabVisits,
      always: 'idle',
    },
  },
};

export const machine = createMachine(BackgroundMachineConfig);
