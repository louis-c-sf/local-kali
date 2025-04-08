import { useCallback, useState } from 'react';

export function useMenuAnchor() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleAnchorClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    },
    [],
  );

  const handleAnchorClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return { anchorEl, open, handleAnchorClick, handleAnchorClose, setAnchorEl };
}
