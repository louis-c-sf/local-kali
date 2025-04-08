import {
  Box,
  Collapse,
  IconButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import Icon from '@/components/Icon';

export default function SecondaryNavSection({
  title,
  children,
  actions,
}: {
  actions?: React.ReactNode;
  children: React.ReactNode;
  title: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const handleClick = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <Box component="li">
      <Box component="ul" style={{ padding: 0 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          textTransform="uppercase"
        >
          <ListItemText
            primary={
              <Typography variant="subtitle" color="gray.80">
                {title}
              </Typography>
            }
          />
          <Stack direction="row">
            {actions}
            <IconButton key={title} onClick={handleClick}>
              <Icon
                sx={{
                  rotate: expanded ? 0 : '180deg',
                  transition: 'rotate 0.3s',
                  color: 'darkBlue.70',
                }}
                icon="chevron-up"
                size={20}
              />
            </IconButton>
          </Stack>
        </Box>
        <Collapse in={expanded}>{children}</Collapse>
      </Box>
    </Box>
  );
}
