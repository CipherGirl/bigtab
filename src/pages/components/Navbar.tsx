import { Header, Title, Container, Group, UnstyledButton } from '@mantine/core';
import React, { useState } from 'react';
import Search from './Search';
import { BackgroundMachineContext } from '../../background/types';

type Props = { context: BackgroundMachineContext };

const Navbar = (props: Props): JSX.Element => {
  const [isSearching, setIsSearching] = useState(false);

  return (
    <Header height={56} style={{ marginBottom: 20 }}>
      <Container
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        size="lg"
        px="lg"
      >
        <Group position="apart" style={{ marginLeft: 50, marginRight: 50 }}>
          <Title order={1}>BigTab</Title>
        </Group>
        <UnstyledButton onClick={() => setIsSearching(true)}>
          <Title order={5}>Search</Title>
        </UnstyledButton>
        <Search
          context={props.context}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
        />
        <Group>
          <Title order={5}>Settings</Title>
        </Group>
      </Container>
    </Header>
  );
};

export default Navbar;
