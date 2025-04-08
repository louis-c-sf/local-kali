import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { resolveValue, Toast, useToaster } from 'react-hot-toast/headless';

const ToastBar = ({ toast }: { toast: Toast }) => {
  const message = resolveValue(toast.message, toast);

  return (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 250,
        damping: 30,
      }}
    >
      {message}
    </motion.div>
  );
};

const Toaster = () => {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  if (toasts.length === 0) return null;

  return (
    <Box
      onMouseEnter={startPause}
      onMouseLeave={endPause}
      sx={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const offset = calculateOffset(toast, {
          reverseOrder: false,
          gutter: 8,
        });
        const ref = (el: HTMLDivElement) => {
          if (el && typeof toast.height !== 'number') {
            const height = el.getBoundingClientRect().height;
            updateHeight(toast.id, height);
          }
        };
        return (
          <Box
            key={toast.id}
            ref={ref}
            sx={{
              position: 'absolute',
              transition: 'all 230ms cubic-bezier(.21,1.02,.73,1)',
              transform: `translateY(${offset * -1}px)`,
              ...(toast.position === 'bottom-right'
                ? { right: 40, bottom: 40 }
                : { left: 40, bottom: 40 }),
              ...(toast.visible
                ? {
                    opacity: 1,
                    zIndex: 9999,
                    '> *': {
                      pointerEvents: 'auto',
                    },
                  }
                : {
                    opacity: 0,
                  }),
            }}
            {...toast.ariaProps}
          >
            <ToastBar toast={toast} />
          </Box>
        );
      })}
    </Box>
  );
};

export default Toaster;
