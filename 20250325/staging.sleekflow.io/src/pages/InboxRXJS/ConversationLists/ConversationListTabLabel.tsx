import { Skeleton, Typography } from '@mui/material';
import React from 'react';

function ConversationListTabLabel({
  label,
  count,
}: {
  label: string;
  count: React.ReactNode;
}) {
  return (
    <Typography
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 0.5,
      }}
      variant={'inherit'}
    >
      {label}
      {count !== undefined ? (
        <span>{` ( ${count} )`}</span>
      ) : (
        <Skeleton
          sx={{
            width: '20px',
            height: '20px',
          }}
        />
      )}
    </Typography>
  );
}

export default ConversationListTabLabel;
