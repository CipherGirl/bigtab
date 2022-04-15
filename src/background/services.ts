import { kebabCase, toNumber } from 'lodash';
import { nanoid } from 'nanoid';
import { BackgroundMachineContext, ClickEvent } from '../common/types';

const getAllTabs = async () => {
  const currentWindow = await chrome.windows.getCurrent();
  const windowTabs = await chrome.tabs.query({
    windowId: currentWindow.id,
  });
  return windowTabs.filter(({ url }) => url && url.startsWith('http'));
};

const getGroupData = async (tab: chrome.tabs.Tab) => {
  if (tab?.groupId && tab?.groupId !== -1) {
    const { groupId } = tab;
    const group = await chrome.tabGroups.get(groupId);
    if (!group.title) {
      return { tab };
    }
    return {
      tab,
      group,
    };
  }
  return { tab };
};

const getBase64FromUrl = async (url: string) => {
  const data = await fetch(url);
  const blob = await data.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
  });
};

const getIconData = async (object: {
  tab: chrome.tabs.Tab;
  group?: chrome.tabGroups.TabGroup;
}) => {
  let iconData: unknown;
  if (object.tab.favIconUrl) {
    try {
      iconData = await getBase64FromUrl(object.tab.favIconUrl);
    } catch (error) {
      iconData = await getBase64FromUrl(
        `https://www.google.com/s2/favicons?domain=${object.tab.url}`,
      );
    }
  } else {
    iconData = await getBase64FromUrl(
      `https://www.google.com/s2/favicons?domain=${object.tab.url}`,
    );
  }
  return {
    ...object,
    tab: {
      ...object.tab,
      icon: iconData,
    },
  };
};

const transformTabs = async (
  tabs: Array<chrome.tabs.Tab>,
  toGroup?: string,
) => {
  const withGroupDataPromise = tabs
    .filter(({ pinned }) => !pinned)
    .map(getGroupData);
  const withGroupData = await Promise.all(withGroupDataPromise);
  const withGroupAndIconDataPromise = withGroupData.map(getIconData);
  const withGroupAndIconData = await Promise.all(withGroupAndIconDataPromise);
  const allGroups = withGroupAndIconData
    .filter((withData) => withData.group)
    .map(({ group }) => group);
  const uniqueGroups = allGroups
    .filter((a, i) => allGroups.findIndex((s) => a?.title === s?.title) === i)
    .map((group) => ({
      id: kebabCase(group?.title),
      title: group?.title,
      color: group?.color,
    }));

  const transformedTabs = withGroupAndIconData.map(({ tab, group }) => ({
    id: `${tab.id}`,
    url: tab.url,
    title: tab.title,
    group: toGroup ?? kebabCase(group?.title) ?? '',
    firstCreated: new Date().getTime(),
    lastModified: new Date().getTime(),
    totalVisits: 0,
    lastVisited: new Date().getTime(),
    icon: tab.icon,
  }));

  await chrome.tabs.remove(transformedTabs.map(({ id }) => toNumber(id)));

  const closedTabs = transformedTabs.map((tab) => ({ ...tab, id: nanoid() }));

  if (toGroup) {
    return {
      tabs: closedTabs,
      groups: [],
    };
  }

  return {
    tabs: closedTabs,
    groups: uniqueGroups,
  };
};

export const sendAllTabs = async (
  context: BackgroundMachineContext,
  event?: ClickEvent,
) => {
  const allTabs = await getAllTabs();
  const allTransformedTabs = await transformTabs(allTabs, event?.toGroup);
  return allTransformedTabs;
};

const DEFAULT_RETURN_OBJECT = {
  tabs: [],
  groups: [],
};

export const sendTab = async (
  context: BackgroundMachineContext,
  event?: ClickEvent,
) => {
  if (event && event.tab) {
    const transformedTabs = await transformTabs([event.tab], event?.toGroup);
    return transformedTabs;
  }
  return DEFAULT_RETURN_OBJECT;
};

export const sendTabsLeft = async (
  context: BackgroundMachineContext,
  event?: ClickEvent,
) => {
  if (event && event.tab && event.tab.index) {
    const allTabs = await getAllTabs();
    const transformedTabs = await transformTabs(
      allTabs.filter(
        (windowTab) => windowTab.index < (event.tab as chrome.tabs.Tab).index,
      ),
      event?.toGroup,
    );
    return transformedTabs;
  }
  return DEFAULT_RETURN_OBJECT;
};

export const sendTabsRight = async (
  context: BackgroundMachineContext,
  event?: ClickEvent,
) => {
  if (event && event.tab && event.tab.index) {
    const allTabs = await getAllTabs();
    const transformedTabs = await transformTabs(
      allTabs.filter(
        (windowTab) => windowTab.index > (event.tab as chrome.tabs.Tab).index,
      ),
      event?.toGroup,
    );
    return transformedTabs;
  }
  return DEFAULT_RETURN_OBJECT;
};

export const sendAllExceptThis = async (
  context: BackgroundMachineContext,
  event?: ClickEvent,
) => {
  if (event && event.tab && event.tab.index) {
    const allTabs = await getAllTabs();
    const transformedTabs = await transformTabs(
      allTabs.filter(
        (windowTab) => windowTab.index !== (event.tab as chrome.tabs.Tab).index,
      ),
      event?.toGroup,
    );
    return transformedTabs;
  }
  return DEFAULT_RETURN_OBJECT;
};

export const sendAllInCurrentTabGroup = async (
  context: BackgroundMachineContext,
  event?: ClickEvent,
) => {
  if (event && event.tab && event.tab.index) {
    const allTabs = await getAllTabs();
    const transformedTabs = await transformTabs(
      allTabs.filter(
        (windowTab) =>
          windowTab.groupId === (event.tab as chrome.tabs.Tab).groupId,
      ),
      event?.toGroup,
    );
    return transformedTabs;
  }
  return DEFAULT_RETURN_OBJECT;
};
