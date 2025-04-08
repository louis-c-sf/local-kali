import { Box, ButtonProps } from '@mui/material';

import { Button } from '@/components/Button';
import Icon from '@/components/Icon';
import { colors } from '@/themes';

const PageMenuToggleButton = (props: ButtonProps) => (
  <Box display="flex">
    <Button
      {...props}
      sx={{
        borderRadius: 0,
        padding: 0,
        minWidth: '68px',
        borderBottom: `1px solid ${colors.grey30}`,
        borderRight: `1px solid ${colors.grey30}`,
      }}
    >
      <Icon
        icon="layout-side-menu-open"
        size={20}
        sx={{ color: 'darkBlue.70' }}
      />
    </Button>
  </Box>
);

export default PageMenuToggleButton;
