import { assign, DoneInvokeEvent } from 'xstate';

import {
  BackgroundMachineContext,
  EventOnCompleteData,
  VisitedTabEvent,
} from '../common/types';

const unique = <T extends { [key: string]: unknown }>(
  original: T[],
  newItems: T[],
  key = 'id',
) => [
  ...original,
  ...newItems.filter(
    (obj) => obj[key] && !original.find((item) => item[key] === obj[key]),
  ),
];

const uniqueExcept = <T extends { [key: string]: unknown }>(
  original: T[],
  newItems: T[],
  key = 'url',
  exceptKey = 'group',
) => [
  ...original,
  ...newItems.filter(
    (obj) =>
      obj[key] &&
      !original.find(
        (item) => item[key] === obj[key] && item[exceptKey] === obj[exceptKey],
      ),
  ),
];

export const addTabs = assign<
  BackgroundMachineContext,
  DoneInvokeEvent<EventOnCompleteData>
>({
  tabs: ({ tabs }, { data }) => uniqueExcept(tabs, data.tabs, 'url'),
  groups: ({ groups }, { data }) => unique(groups, data.groups),
});

export const updateTabVisits = assign<BackgroundMachineContext>({
  tabs: ({ tabs }, data) => {
    const clippedUrl = (data as VisitedTabEvent).tabUrl;
    if (clippedUrl && typeof clippedUrl === 'string') {
      return tabs.map((tab) => {
        if (tab.url.split('?')[0] === (clippedUrl.split('?')[0] ?? '')) {
          return {
            ...tab,
            totalVisits: (tab.totalVisits ?? 0) + 1,
            lastVisited: new Date().getTime(),
          };
        }
        return tab;
      });
    }
    return tabs;
  },
});
