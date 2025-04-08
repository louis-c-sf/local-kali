import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import Icon from '@/components/Icon';
import PageTitle from '@/components/PageTitle';

const PageHeaderWithBackButton = ({
  title,
  subtitle,
  action,
  onBackButtonClicked,
}: {
  title: ReactNode;
  subtitle?: string;
  action?: ReactNode;
  onBackButtonClicked?: () => void;
}) => {
  const navigate = useNavigate();

  return (
    <Stack direction="row">
      <Button
        sx={{
          padding: 0,
          minWidth: '68px',
          borderRadius: 0,
          borderBottom: `1px solid`,
          borderRight: `1px solid`,
          borderColor: 'gray.30',
        }}
        onClick={() =>
          onBackButtonClicked ? onBackButtonClicked() : navigate('..')
        }
      >
        <Icon icon="arrow-left" size={20} />
      </Button>
      <Box width="100%">
        <Stack
          direction="row"
          sx={(theme) => ({
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.palette.gray[30]}`,
            alignItems: 'center',
            paddingX: '2rem',
          })}
        >
          <PageTitle
            title={title}
            subtitleComponent={
              subtitle && (
                <Typography
                  sx={{
                    fontSize: '12px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
                  variant="subtitle"
                >
                  {subtitle}
                </Typography>
              )
            }
          />
          {action}
        </Stack>
      </Box>
    </Stack>
  );
};

export default PageHeaderWithBackButton;
