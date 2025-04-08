import { Box, Typography } from '@mui/material';
import React from 'react';

import { colors } from '@/themes';

const PageTitle = ({
  title,
  subtitleComponent,
  ...rest
}: {
  title: React.ReactNode;
  subtitleComponent?: React.ReactNode;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: '4px',
        height: '64px',
        whiteSpace: 'nowrap',
      }}
      {...rest}
    >
      {subtitleComponent}
      <Typography
        variant={subtitleComponent ? 'headline2' : 'headline1'}
        sx={{
          width: 'max-content',
          color: colors.darkBlue90,
          maxWidth: '80vw',
        }}
        noWrap
      >
        {title}
      </Typography>
    </Box>
  );
};

export default PageTitle;
