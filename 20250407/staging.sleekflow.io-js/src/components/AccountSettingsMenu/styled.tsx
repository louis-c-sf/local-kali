import {
  List,
  ListItemButton as MuiListItemButton,
  styled,
} from '@mui/material';

import { colors } from '@/themes';

export const ListItemButton = styled(MuiListItemButton)({
  color: colors.darkBlue70,
  '&:hover': {
    backgroundColor: colors.grey10,
  },
}) as typeof MuiListItemButton;

export const MenuList = styled(List)({
  color: colors.darkBlue70,
  '& > :not(:first-of-type)': {
    marginTop: '4px',
  },
});
