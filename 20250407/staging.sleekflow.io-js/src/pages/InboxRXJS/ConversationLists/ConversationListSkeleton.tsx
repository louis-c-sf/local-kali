import { Skeleton, Stack } from '@mui/material';

const ConversationListSkeleton = () => {
  return (
    <Stack width={'100%'}>
      {[...Array(5)].map((_, idx) => (
        <Stack py="16px" px="20px" key={idx} width={'100%'}>
          <Stack direction="row" alignItems="center" spacing="8px" mb="8px">
            <Skeleton variant="circular" height={32} width={32} />
            <Skeleton variant="text" height={16} width={80} />
          </Stack>
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} width={'calc(100% - 60px)'} />
          <Stack direction="row" spacing="8px" mt="8px">
            <Skeleton height={28} width={50} sx={{ borderRadius: '10px' }} />
            <Skeleton height={28} width={50} sx={{ borderRadius: '10px' }} />
            <Skeleton height={28} width={70} sx={{ borderRadius: '10px' }} />
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};

export default ConversationListSkeleton;
