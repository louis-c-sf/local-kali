import { useState, useCallback } from "react";

export function useHoveredFlag() {
  const [hovered, setHovered] = useState(false);

  const handleMouseOver = useCallback(() => {
    setHovered(true);
  }, [setHovered]);

  const handleMouseOut = useCallback(() => {
    setHovered(false);
  }, [setHovered]);

  return {
    onMouseOver: handleMouseOver,
    onMouseOut: handleMouseOut,
    hovered,
  };
}
