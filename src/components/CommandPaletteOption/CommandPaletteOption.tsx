import React, { MouseEvent, createRef } from 'react';
import { Tab } from '../../common/types';
import { checkIntersection } from '../../common/utils';
import { GroupTag } from '../GroupTag';
import styles from './CommandPaletteOption.module.css';

type CommandPaletteOptionProps = {
  option: Tab;
  onGroupSelected: (groupId: string) => void | Promise<void>;
};

export const CommandPaletteOption: React.FC<CommandPaletteOptionProps> = ({
  option,
  onGroupSelected,
}) => {
  const tagRef = createRef<HTMLDivElement>();

  const openURL = (e: MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    const isIntersectingRef = checkIntersection(
      e.clientX,
      e.clientY,
      tagRef?.current?.getBoundingClientRect(),
    );
    if (!isIntersectingRef) {
      window.open(url, '_blank');
    } else {
      onGroupSelected(option.group);
    }
  };

  return (
    <a
      className={styles.optionContainer}
      href={option.url}
      rel="noreferrer"
      target="_blank"
      draggable="false"
      onClick={(e) => openURL(e, option.url)}
      onKeyDown={(e) => e.preventDefault()}
    >
      <GroupTag option={option} ref={tagRef} />
      <img className={styles.optionFavicon} src={option.icon} alt="Icon" />
      <div className={styles.option}>
        <p className={styles.optionText}>{option.title}</p>
      </div>
    </a>
  );
};
