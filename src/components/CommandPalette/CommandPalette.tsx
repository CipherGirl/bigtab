import { toNumber } from 'lodash';
import React, {
  createRef,
  useEffect,
  useRef,
  useState,
  MouseEvent,
  LegacyRef,
} from 'react';
import { search } from '../../common/search';
import { Tab } from '../../common/types';
import { checkIntersection } from '../../common/utils';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useMachineContext } from '../../hooks/useMachineContext';
import { CommandPaletteOption } from '../CommandPaletteOption';
import { TabSearchIcon } from '../TabSearchIcon';
import styles from './CommandPalette.module.css';

type CommandPaletteProps = {
  onClickedOutside: () => void | Promise<void>;
  open: boolean;
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onClickedOutside,
  open,
}) => {
  // Context + State
  const context = useMachineContext();
  const [highlightedTab, setHighlightedTab] = useState<Tab | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [boundingBox, setBoundingBox] = useState<DOMRect>({} as DOMRect);
  const filteredTabs = search(context, searchQuery, selectedGroup);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const boundaryRef = createRef<HTMLDivElement>();

  // Event Handlers
  const onSearchChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSearchQuery(e.currentTarget.value);
  };

  const openTab = (tab: Tab) => {
    window.open(tab.url, '_blank');
  };

  const openAllTabs = (tabs: Array<Tab>) => tabs.map(openTab);

  const handleEnter = ({ activeElement }: { activeElement: HTMLElement }) => {
    if (activeElement === inputRef.current || highlightedTab === null) {
      openAllTabs(filteredTabs.tabs);
    } else {
      openTab(highlightedTab);
    }
  };

  const handleEscape = () => {
    setSearchQuery('');
    setSelectedGroup('');
    onClickedOutside();
  };

  const handleNthMeta = ({ event }: { event: KeyboardEvent }) => {
    openTab(filteredTabs.tabs[toNumber(event.key.slice(-1))]);
  };

  const handleArrowKey = ({
    event,
    currentIndex,
    availableElements,
  }: {
    event: KeyboardEvent;
    currentIndex: number;
    availableElements: Array<HTMLElement>;
  }) => {
    // console.log(event);
    if (currentIndex === -1) {
      inputRef?.current?.focus();
      setHighlightedTab(null);
    }
    let nextElement: HTMLElement | undefined;
    if (!event.metaKey && !event.ctrlKey && !event.altKey) {
      if (event.key === 'ArrowDown') {
        nextElement = availableElements[currentIndex + 1];
        setHighlightedTab(filteredTabs.tabs[currentIndex]);
      } else {
        nextElement = availableElements[currentIndex - 1];
        setHighlightedTab(filteredTabs.tabs[currentIndex - 2]);
      }
    } else if (event.altKey) {
      const containerBoundary = document
        .getElementById('altBoundary')
        ?.getBoundingClientRect();
      if (event.key === 'ArrowDown') {
        if (currentIndex - 1 >= filteredTabs.tabs.length - 1) {
          nextElement = availableElements[currentIndex];
          setHighlightedTab(filteredTabs.tabs[filteredTabs.tabs.length - 1]);
        }
        const offScreenIndex = availableElements.findIndex(
          (element) =>
            element.getBoundingClientRect().top >
            (containerBoundary?.bottom ?? 0),
        );
        const finalIndex =
          offScreenIndex > 0 ? offScreenIndex - 1 : filteredTabs.tabs.length;
        nextElement = availableElements[finalIndex];
        setHighlightedTab(
          filteredTabs.tabs[finalIndex > 1 ? finalIndex - 1 : 1],
        );
      } else {
        const offScreenIndex = availableElements.findIndex(
          (element) =>
            element.getBoundingClientRect().top > (containerBoundary?.top ?? 0),
        );
        const finalIndex = offScreenIndex > 0 ? offScreenIndex - 1 : 0;
        nextElement = availableElements[finalIndex];
        setHighlightedTab(
          filteredTabs.tabs[finalIndex > 1 ? finalIndex - 1 : 1],
        );
      }
    } else if (event.key === 'ArrowDown') {
      nextElement = availableElements[availableElements.length - 1];
      setHighlightedTab(filteredTabs.tabs[filteredTabs.tabs.length - 1]);
    } else {
      [, nextElement] = availableElements;
      setHighlightedTab(filteredTabs.tabs[0]);
    }

    if (nextElement) {
      nextElement.focus();
    }
    event.preventDefault();
  };

  const parentRef = useKeyboardNavigation(
    {
      onEnter: handleEnter,
      onEscape: handleEscape,
      onNthMetaKey: handleNthMeta,
      onArrowKey: handleArrowKey,
    },
    'a,input',
  );

  const groupSelected = (groupId: string) => {
    const box = boundaryRef?.current?.getBoundingClientRect();
    if (box) {
      setBoundingBox(box);
    }
    setSelectedGroup(groupId);
  };

  // Hooks
  useEffect(() => {
    const clickedOutside = () => {
      setSearchQuery('');
      setSelectedGroup('');
      onClickedOutside();
    };

    const listener = (e: unknown) => {
      const isIntersectingRef = checkIntersection(
        (e as MouseEvent).clientX,
        (e as MouseEvent).clientY,
        boundingBox,
      );
      if (!isIntersectingRef) {
        clickedOutside();
      }
    };

    document.addEventListener('click', listener);

    return () => {
      document.removeEventListener('click', listener);
    };
  }, [boundingBox, onClickedOutside]);

  useEffect(() => {
    if (open) {
      inputRef?.current?.focus();
    } else {
      setSearchQuery('');
      setSelectedGroup('');
    }
  }, [open]);

  useEffect(() => {
    const box = boundaryRef?.current?.getBoundingClientRect();
    if (box) {
      setBoundingBox(box);
    }
  }, [selectedGroup, boundaryRef]);

  // Component
  return (
    <>
      <div className={styles.palette} role="dialog" aria-modal="true">
        <div className={styles.overlay} />
        <div
          className={styles.wrapper}
          ref={parentRef as LegacyRef<HTMLDivElement>}
        >
          <div className={styles.contents} ref={boundaryRef}>
            <div className={styles.search}>
              <TabSearchIcon />
              <input
                type="text"
                placeholder="Search your Saved Tabs..."
                spellCheck="false"
                className={styles.input}
                ref={inputRef}
                onChange={onSearchChange}
              />
            </div>
            <div className={styles.options} id={'altBoundary'}>
              {filteredTabs.tabs.map((option: Tab, index: number) => (
                <CommandPaletteOption
                  key={index}
                  option={option}
                  onGroupSelected={groupSelected}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
