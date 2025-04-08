import { Theme } from '@mui/material';

export const getNavMenuItemStyles = (theme: Theme, isActive: boolean) => ({
  padding: `${theme.spacing(1)} ${theme.spacing(1.5)}`,
  borderRadius: '8px',
  width: 'auto',
  color: isActive ? theme.palette.white : theme.palette.gray[90],
  backgroundColor: isActive ? theme.palette.darkBlue[80] : 'transparent',
  overflow: 'hidden',
  '&:hover': {
    backgroundColor: theme.palette.darkBlue[80],
    color: theme.palette.white,
  },
});
