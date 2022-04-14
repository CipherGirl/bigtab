import React from 'react';
import { BackgroundMachineContext, Tab } from '../../background/types';
import TabGroup from './TabGroup';

type Props = { context: BackgroundMachineContext };

const Collection = (props: Props): JSX.Element => {
  const { groups, tabs } = props.context;

  return (
    <div style={{ width: 340, margin: 'auto' }}>
      {groups
        .slice()
        .reverse()
        .map((group) => (
          <TabGroup
            group={group}
            tabs={tabs.filter((tab: Tab) => tab.group === group.id)}
            key={group.id}
          />
        ))}
      <TabGroup tabs={tabs.filter((tab: Tab) => tab.group === '')} />
    </div>
  );
};

export default Collection;
