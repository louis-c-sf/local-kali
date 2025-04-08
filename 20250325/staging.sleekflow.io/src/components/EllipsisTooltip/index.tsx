import { useIsOverflow } from '@/hooks/useIsOverflow';
import { Tooltip, TooltipProps, useForkRef } from '@mui/material';
import { ReactElement, ReactNode, useRef } from 'react';
import type { UseMeasureRect } from 'react-use/lib/useMeasure';

interface EllipsisTooltipProps
  extends Omit<TooltipProps, 'title' | 'children'> {
  title?: ReactNode;
  children:
    | ReactElement
    | ((isOverflow: boolean, measurements: UseMeasureRect) => ReactElement);
}

export const EllipsisTooltip = ({
  title,
  children,
  ...props
}: EllipsisTooltipProps) => {
  const [measureRef, isOverflow, measurements] = useIsOverflow<HTMLElement>();
  const ref = useRef<HTMLElement>(null);

  return (
    <Tooltip
      ref={useForkRef(measureRef, ref)}
      disableHoverListener={!isOverflow}
      disableTouchListener={!isOverflow}
      title={title || ref.current?.textContent}
      {...props}
    >
      {typeof children === 'function'
        ? children(isOverflow, measurements)
        : children}
    </Tooltip>
  );
};
