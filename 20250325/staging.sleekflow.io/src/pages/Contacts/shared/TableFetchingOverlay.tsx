import { Backdrop, Box, CircularProgress, SxProps, Theme } from '@mui/material';
import { RefObject, useSyncExternalStore } from 'react';

const TableFetchingOverlay = ({
  containerRef,
  isFetching,
  sx,
}: {
  isFetching: boolean;
  containerRef: RefObject<HTMLElement>;
  sx?: SxProps<Theme>;
}) => {
  const tableViewportSize = useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => {
        window.removeEventListener('resize', callback);
      };
    },
    () => {
      if (containerRef.current) {
        return containerRef.current.getBoundingClientRect().width;
      }
      return 'auto';
    },
  );

  if (!isFetching) {
    return null;
  }
  return (
    <Backdrop
      sx={{
        left: 0,
        color: 'black',
        position: 'absolute',
        zIndex: 60,
        width: '100%',
        background: 'rgba(255,255,255,0.8)',
        display: 'flex',
        ...sx,
      }}
      open={isFetching}
    >
      <Box
        sx={{
          position: 'sticky',
          justifyContent: 'center',
          right: 0,
          left: 0,
          width: tableViewportSize,
          display: 'flex',
        }}
      >
        <CircularProgress color="inherit" />
      </Box>
    </Backdrop>
  );
};

export default TableFetchingOverlay;
