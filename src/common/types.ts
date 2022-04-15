export type Tab = {
  id: string;
  url: string;
  title: string;
  icon: string;
  group: string;
  firstCreated: number;
  lastModified: number;
  lastVisited: number;
  totalVisits: number;
};

export type TabGroupColor =
  | 'grey'
  | 'blue'
  | 'red'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'purple'
  | 'cyan'
  | 'orange';

export type TabGroups = {
  id: string;
  title: string;
  color: TabGroupColor;
};

export type BackgroundMachineContext = {
  retries: number;
  installedTimestamp: number;
  version: string;
  tabs: Array<Tab>;
  groups: Array<TabGroups>;
  settings: Record<string, unknown>;
};

export type ContextMenuEvent = {
  type: 'CONTEXT_MENU';
  info: chrome.contextMenus.OnClickData;
  tab?: chrome.tabs.Tab;
  toGroup?: string;
};

export type ClickActionEvent = {
  type: 'CLICK_ACTION';
  tab?: chrome.tabs.Tab;
  info?: never;
  toGroup?: never;
};

export type VisitedTabEvent = {
  type: 'VISIT_TAB';
  tabUrl?: string;
  info?: never;
  toGroup?: never;
};

export type ClickEvent = ContextMenuEvent | ClickActionEvent;

export type EventOnCompleteData = {
  tabs: Array<Tab>;
  groups: Array<TabGroups>;
};

export type BackgroundMachineEvent =
  | ContextMenuEvent
  | ClickActionEvent
  | VisitedTabEvent;
