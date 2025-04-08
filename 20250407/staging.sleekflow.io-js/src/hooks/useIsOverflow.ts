import { useForkRef } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useMeasure } from 'react-use';

export const useIsOverflow = <T extends Element>() => {
  const ref = useRef<T>(null);
  const [measureRef, measurements] = useMeasure<T>();
  const { width, height } = measurements;
  const forkedRef = useForkRef<T>(ref, measureRef);

  const checkOverflow = useCallback(() => {
    if (ref.current) {
      const range = document.createRange();
      range.selectNodeContents(ref.current);
      const rect = range.getBoundingClientRect();

      return (
        rect.width > ref.current.clientWidth + 1 ||
        rect.height > ref.current.clientHeight + 1
      );
    }
    return false;
  }, []);

  const [isOverflow, setIsOverflow] = useState(() => checkOverflow());

  useEffect(() => {
    setIsOverflow(checkOverflow());
  }, [checkOverflow, width, height]);

  return [forkedRef, isOverflow, measurements] as const;
};
