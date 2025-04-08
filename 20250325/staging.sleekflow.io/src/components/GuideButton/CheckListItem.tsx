import { Box, ListItem, Stack, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';

import { useRouteWithLocale } from '@/hooks/useRouteWithLocale/useRouteWithLocale';

export default function CheckListItem(props: {
  index: number;
  title: string;
  description: string;
  buttonText: string;
  redirectUrl: string;
}) {
  const { index, title, description, buttonText, redirectUrl } = props;
  const routeTo = useRouteWithLocale();

  return (
    <ListItem
      key={`${title}-${index}`}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px',
      }}
    >
      <Box
        sx={{
          color: 'blue.90',
          fontSize: '14px',
          lineHeight: '14px',
          fontWeight: '600',
          backgroundColor: 'blue.20',
          borderRadius: '4px',
          padding: '7px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '12px',
        }}
      >
        {index + 1}
      </Box>
      <Stack spacing={0.5}>
        <Typography variant="headline4">{title}</Typography>
        <Typography variant="body2">{description}</Typography>
        <Typography
          component={NavLink}
          variant="body2"
          color="blue.90"
          fontWeight={600}
          sx={{ textDecoration: 'none' }}
          to={routeTo(redirectUrl)}
        >
          {buttonText}
        </Typography>
      </Stack>
    </ListItem>
  );
}
