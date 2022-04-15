import { match, P } from 'ts-pattern';

export type SupportedKeyboardNavigationEvents =
  | 'onEnter'
  | 'onEscape'
  | 'onArrowKey'
  | 'onNthMetaKey';

const getElementsAndIndex = <T extends HTMLElement>(
  parentNode: T | null,
  selectors: string,
):
  | {
      availableElements: Array<HTMLElement>;
      currentIndex: number;
      activeElement: Element | null;
    }
  | undefined => {
  if (!parentNode) return undefined;

  const { activeElement } = document;

  // If we're not inside the container, don't do anything
  if (!parentNode.contains(activeElement)) return undefined;

  // Get the list of elements we're allowed to scroll through
  const availableElements = Array.from(
    parentNode.querySelectorAll<HTMLElement>(selectors),
  );

  // No elements are available to loop through.
  if (!availableElements.length) return undefined;

  // Which index is currently selected
  const currentIndex = availableElements.findIndex(
    (availableElement) => availableElement === activeElement,
  );

  return { availableElements, currentIndex, activeElement };
};

const handleKeyPress = (
  events: {
    [onEvent in SupportedKeyboardNavigationEvents]?: (args: {
      event: KeyboardEvent;
      availableElements: Array<HTMLElement>;
      activeElement: HTMLElement;
      currentIndex: number;
    }) => void;
  },
  event: KeyboardEvent,
  availableElements: Array<HTMLElement>,
  activeElement: HTMLElement,
  currentIndex: number,
) => {
  const { key } = event;
  match(key)
    .with(
      'Enter',
      () =>
        events.onEnter &&
        events.onEnter({
          event,
          availableElements,
          activeElement,
          currentIndex,
        }) &&
        event.preventDefault(),
    )
    .with(
      'ArrowUp',
      'ArrowDown',
      () =>
        events.onArrowKey &&
        events.onArrowKey({
          event,
          availableElements,
          activeElement,
          currentIndex,
        }) &&
        event.preventDefault(),
    )
    .with(
      'Escape',
      () =>
        events.onEscape &&
        events.onEscape({
          event,
          availableElements,
          activeElement,
          currentIndex,
        }) &&
        event.preventDefault(),
    )
    .with(
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      () =>
        (event.metaKey || event.ctrlKey) &&
        events.onNthMetaKey &&
        events.onNthMetaKey({
          event,
          availableElements,
          activeElement,
          currentIndex,
        }) &&
        event.preventDefault(),
    )
    .with(P.any, () => {})
    .run();
};

export const handleKeyboardEvents = <T extends HTMLElement>(
  event: KeyboardEvent,
  parentNode: T,
  selectors: string,
  events: {
    [onEvent in SupportedKeyboardNavigationEvents]?: (args: {
      event: KeyboardEvent;
      availableElements: Array<HTMLElement>;
      activeElement: HTMLElement;
      currentIndex: number;
    }) => void;
  },
) => {
  const elementsAndIndex = getElementsAndIndex(parentNode, selectors);

  if (elementsAndIndex) {
    const { availableElements, currentIndex, activeElement } = elementsAndIndex;
    handleKeyPress(
      events,
      event,
      availableElements,
      activeElement as HTMLElement,
      currentIndex,
    );
  }
};
