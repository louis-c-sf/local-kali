import { Menu as MuiMenu, MenuProps, styled } from '@mui/material';

import { ScrollArea } from '@/components/ScrollArea';

export const MenuPaperRoot = styled(ScrollArea)(({ theme }) => ({
  background: theme.palette.white,
  width: 'max-content',
  minWidth: '240px',
  '& div': {
    maxHeight: '324px',
  },
  boxShadow: theme.shadow.lg,
}));

export default function Menu(props: MenuProps) {
  return (
    <MuiMenu
      {...props}
      slots={{
        paper: MenuPaperRoot,
      }}
    />
  );
}
