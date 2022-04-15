import React, { useEffect, useState } from 'react';
import { CommandPalette } from '../../components/CommandPalette';

export const Overlay: React.FC = () => {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    setOpen((_open) => !_open);
  };

  useEffect(() => {
    document.addEventListener(
      'keydown',
      (e) =>
        (e.metaKey || e.ctrlKey) &&
        e.code === 'KeyJ' &&
        toggle() &&
        e.preventDefault(),
    );
  }, []);

  return (
    <>{open && <CommandPalette onClickedOutside={toggle} open={open} />}</>
  );
};
