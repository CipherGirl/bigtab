import { messages } from '@extend-chrome/messages';

export const sendContext = async <T>(context: T) => {
  try {
    await messages.send({
      greeting: 'CONTEXT',
      data: context,
    });
  } catch (error) {
    // console.log('no runtime connected');
  }

  const tabs = await chrome.tabs.query({ windowType: 'normal' });
  const tabPromises = tabs.map(async (tab) => {
    try {
      await messages.send(
        {
          greeting: 'CONTEXT',
          data: context,
        },
        {
          tabId: tab.id,
        },
      );
    } catch (error) {
      // console.log('tab destroyed');
    }
  });

  await Promise.all(tabPromises);
};

export const contextStream = {
  subscribe: <T>(subscriber: (data: T) => void | Promise<void>) => {
    messages.stream.subscribe(async ([message]) => {
      if (message.greeting === 'CONTEXT') {
        await subscriber(message.data);
      }
    });
  },
};
