import { useState } from 'react';

const Dropdown = ({
  children,
}: {
  children: ({
    open,
    anchorEl,
    handleOpen,
    onClose,
  }: {
    open: boolean;
    anchorEl: null | HTMLElement;
    handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
    onClose: () => void;
  }) => JSX.Element;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  return <>{children({ open, anchorEl, handleOpen, onClose })}</>;
};

export default Dropdown;
