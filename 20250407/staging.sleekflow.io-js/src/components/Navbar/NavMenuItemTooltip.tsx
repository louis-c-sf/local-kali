import { styled, Tooltip, TooltipProps } from '@mui/material';

export const NavMenuItemToolTip = styled(
  ({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ),
)({
  '& .MuiTooltip-tooltip': {
    fontSize: 14,
  },
  // Hack to control the offset
  '& .MuiTooltip-tooltipPlacementRight': {
    marginLeft: '8px !important',
  },
});
