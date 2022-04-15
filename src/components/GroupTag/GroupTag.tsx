import React, { forwardRef } from 'react';
import { Tab } from '../../common/types';
import { useMachineContext } from '../../hooks/useMachineContext';
import styles from './GroupTag.module.css';

type GroupTagProps = {
  option: Tab;
};

const GroupTag = forwardRef<HTMLDivElement, GroupTagProps>(
  ({ option }, ref) => {
    const context = useMachineContext();

    const getGroup = (group: string) => {
      if (group) {
        return context.groups.find((_group) => _group.id === group);
      }
      return undefined;
    };

    const getGroupName = (tab: Tab) => getGroup(tab.group)?.title ?? 'None';

    const getColors = (tab: Tab) => {
      const group = getGroup(tab.group);
      // TODO: Better Colors WCAG AAA Contrast
      // SOURCE: https://webaim.org/resources/contrastchecker/
      // SOURCE: https://coolors.co/
      if (!group) {
        return {
          color: '#515151',
          backgroundColor: '#E0E0E0',
        };
      }
      switch (group.color) {
        case 'orange':
          return {
            color: '#2B2B2B',
            backgroundColor: '#FF9F6B',
          };
        case 'grey':
          return {
            color: '#515151',
            backgroundColor: '#E0E0E0',
          };
        case 'blue':
          return {
            color: '#113EA7',
            backgroundColor: '#D5E2FC',
          };
        case 'red':
          return {
            color: '#C40812',
            backgroundColor: '#FFE0E0',
          };
        case 'yellow':
          return {
            color: '#4D4D4D',
            backgroundColor: '#F8D472',
          };
        case 'green':
          return {
            color: '#033F2F',
            backgroundColor: '#B5DEBB',
          };
        case 'pink':
          return {
            color: '#D1007A',
            backgroundColor: '#FFF0F4',
          };
        case 'purple':
          return {
            color: '#53267E',
            backgroundColor: '#DDCDEF',
          };
        case 'cyan':
          return {
            color: '#12586E',
            backgroundColor: '#E1F9F9',
          };
        default:
          return {
            color: '#515151',
            backgroundColor: '#E0E0E0',
          };
      }
    };

    return (
      <div
        className={styles.groupTagContainer}
        style={getColors(option)}
        ref={ref}
      >
        <span className={styles.groupTagText}>{getGroupName(option)}</span>
      </div>
    );
  },
);

GroupTag.displayName = 'GroupTag';

export { GroupTag };
