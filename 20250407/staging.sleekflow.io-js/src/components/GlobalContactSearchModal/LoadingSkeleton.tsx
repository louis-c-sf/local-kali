import { Skeleton, Stack } from '@mui/material';

export default function LoadingSkeleton() {
  return (
    <Stack spacing="12px">
      <Stack
        direction="row"
        spacing={2}
        sx={(theme) => ({
          p: '12px 16px',
          alignItems: 'center',
          borderTop: `1px solid ${theme.palette.gray[30]}`,
        })}
      >
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ ml: '14px' }}
        />
        <Stack direction="column" spacing={1 / 2} width="60%">
          <Skeleton variant="rectangular" width="60%" height={14} />
          <Skeleton variant="rectangular" width="100%" height={12} />
        </Stack>
      </Stack>
    </Stack>
  );
}
