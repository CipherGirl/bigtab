import { useRef, useEffect, MutableRefObject } from 'react';
import {
  handleKeyboardEvents,
  SupportedKeyboardNavigationEvents,
} from './handleKeyboardEvents';

export const useKeyboardNavigation = <T extends HTMLElement>(
  events: {
    [onEvent in SupportedKeyboardNavigationEvents]?: (args: {
      event: KeyboardEvent;
      availableElements: Array<HTMLElement>;
      activeElement: HTMLElement;
      currentIndex: number;
    }) => void;
  },
  selectors = 'a,input',
) => {
  const ref = useRef<T>();

  useEffect(() => {
    const eventHandler = (event: KeyboardEvent) => {
      if (ref.current) {
        handleKeyboardEvents(event, ref.current, selectors, events);
      }
    };
    document.addEventListener('keydown', eventHandler);
    return () => document.removeEventListener('keydown', eventHandler);
  }, [events, selectors]);

  return ref as MutableRefObject<T>;
};
