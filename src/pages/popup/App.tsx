import React, { useEffect, useLayoutEffect, useState } from 'react';
import { DEFAULT_CONTEXT } from '../../background/context';
import { getStorage } from '../../background/storage';
import { BackgroundMachineContext } from '../../background/types';

import { contextStream } from '../../common/messages';
import Navbar from '../components/Navbar';
import Collection from '../components/Collection';

const App = (): JSX.Element => {
  const [context, setContext] = useState(
    DEFAULT_CONTEXT as BackgroundMachineContext,
  );

  useEffect(() => {
    const getFromStorage = async () => {
      const localContext = (await getStorage()) as BackgroundMachineContext;
      setContext(localContext);
    };
    getFromStorage();
  }, []);

  useLayoutEffect(() => {
    contextStream.subscribe((newContext: BackgroundMachineContext) => {
      setContext(newContext);
    });
  }, []);

  return (
    <div>
      <Navbar context={context} />
      <Collection context={context} />
    </div>
  );
};

export default App;
