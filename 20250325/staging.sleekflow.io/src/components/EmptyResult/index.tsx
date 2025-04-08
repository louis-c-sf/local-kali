import { Box, Stack, StackProps, Typography } from '@mui/material';

import { IconNames } from '@/assets/icomoon/icon';
import Icon from '@/components/Icon';

interface EmptyResultProps extends StackProps {
  icon?: IconNames;
  title: string;
  backgroundColor?: string;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
}

const EmptyResult = ({
  icon,
  title,
  backgroundColor,
  description,
  actions,
  ...rest
}: EmptyResultProps) => {
  return (
    <Stack spacing="24px" alignItems="center" {...rest}>
      <Stack spacing="8px" alignItems="center">
        <Box
          sx={{
            width: '32px',
            height: '32px',
            backgroundColor: backgroundColor ?? 'gray.10',
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            icon={icon ?? 'file-search'}
            sx={{ color: 'gray.90' }}
            size={20}
          />
        </Box>
        <Typography sx={{ textAlign: 'center' }} variant="headline4">
          {title}
        </Typography>
        {typeof description === 'string' ? (
          <Typography sx={{ textAlign: 'center' }} variant="body2">
            {description}
          </Typography>
        ) : description ? (
          description
        ) : null}
      </Stack>
      {actions}
    </Stack>
  );
};

export default EmptyResult;
