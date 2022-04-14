import { ColorSwatch, Divider, Card, Text, Group } from '@mantine/core';
import React from 'react';
import { Tab, TabGroups } from '../../background/types';

type Props = { group?: TabGroups; tabs: Array<Tab> };

const TabGroup = (props: Props): JSX.Element => {
  const { group, tabs } = props;
  console.log(group, tabs);
  return (
    <div>
      <Card withBorder style={{ width: 600, margin: 'auto', marginBottom: 20 }}>
        <Card.Section>
          <Group style={{ margin: 15 }}>
            {group ? <ColorSwatch color={group.color} /> : null}
            <Text weight={500}>{group ? group.title : 'Ungrouped Tabs'}</Text>
          </Group>
          <Divider my="sm" />
        </Card.Section>
        {tabs.map((tab) => (
          <li key={tab.id}>
            <Text component="a" color="gray" href={tab.url} target="_blank">
              {tab.title}
            </Text>
          </li>
        ))}
      </Card>
    </div>
  );
};
export default TabGroup;
