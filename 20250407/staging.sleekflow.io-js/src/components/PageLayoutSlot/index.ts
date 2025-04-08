import React from 'react';
import { createPortal } from 'react-dom';

const PageLayoutSlot = ({
  children,
  anchorEl,
}: {
  children: React.ReactNode;
  anchorEl: HTMLElement | null;
}) => {
  if (anchorEl) {
    return createPortal(children, anchorEl);
  }
  return null;
};

export default PageLayoutSlot;
