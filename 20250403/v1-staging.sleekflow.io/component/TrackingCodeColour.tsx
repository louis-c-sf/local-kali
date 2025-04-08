import React, { useEffect, useState } from "react";
import { ChromePicker, ColorResult } from "react-color";

interface TrackingCodeColourProps {
  setPropsColor: Function;
  currentColor: string;
  colorPos: string;
  disabled?: boolean;
}
export default (props: TrackingCodeColourProps) => {
  const { setPropsColor, currentColor, colorPos, disabled } = props;
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState<string>("");
  useEffect(() => {
    if (currentColor && color !== currentColor) {
      const rgb = currentColor.match(
        /^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i
      );
      if (rgb) {
        const hexStr = `#${("0" + parseInt(rgb[1]).toString(16)).slice(-2)}${(
          "0" + parseInt(rgb[2]).toString(16)
        ).slice(-2)}${("0" + parseInt(rgb[3]).toString(16)).slice(-2)}`;
        setColor(hexStr);
      } else {
        setColor(currentColor);
      }
    }
  }, [currentColor]);

  const toggleColorPicker = () => {
    !disabled && setDisplayColorPicker(!displayColorPicker);
  };
  const handleChange = (color: ColorResult) => {
    setColor(color.hex);
    // const { hex } = color;
    const { r, g, b, a } = color.rgb;
    setPropsColor(`rgba(${r}, ${g}, ${b}, ${a || 1})`, colorPos);
  };
  const handleClose = () => {
    setDisplayColorPicker(false);
  };
  return (
    <div className={`tracking-color ${displayColorPicker ? "focused" : ""}`}>
      <div className="color-text" onClick={toggleColorPicker}>
        <span className="p2">{`${color}`}</span>
        <div className="color-display">
          <div style={{ background: `${color}` }}></div>
        </div>
      </div>
      {displayColorPicker && (
        <div className="color-picker">
          <div className="cover" onClick={handleClose}></div>
          <ChromePicker color={color} onChangeComplete={handleChange} />
        </div>
      )}
    </div>
  );
};
