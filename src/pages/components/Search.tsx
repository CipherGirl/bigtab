import React, { useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { TextInput, Text, Modal } from '@mantine/core';
import { BackgroundMachineContext } from '../../background/types';

type Props = {
  context: BackgroundMachineContext;
  isSearching: boolean;
  setIsSearching: any;
};

const Search = (props: Props): JSX.Element => {
  const { tabs } = props.context;
  const { isSearching, setIsSearching } = props;
  const [value, setValue] = useState('');
  const [debounced] = useDebouncedValue(value, 200);
  const [result, setResult] = useState(tabs);

  useEffect(() => {
    const search = tabs.filter((item) =>
      item.title.toLocaleLowerCase().includes(debounced.toLocaleLowerCase()),
    );
    if (value === '') setResult([]);
    else setResult(search);
  }, [debounced, value, tabs]);

  return (
    <>
      <Modal
        opened={isSearching}
        onClose={() => setIsSearching()}
        title="Search"
      >
        <TextInput
          label="Enter value to see debounce"
          value={value}
          style={{ flex: 1 }}
          onChange={(event) => setValue(event.currentTarget.value)}
        />

        {result.map((tab) => (
          <li key={tab.id}>
            <Text component="a" color="gray" href={tab.url} target="_blank">
              {tab.title}
            </Text>
          </li>
        ))}
      </Modal>
    </>
  );
};

export default Search;
