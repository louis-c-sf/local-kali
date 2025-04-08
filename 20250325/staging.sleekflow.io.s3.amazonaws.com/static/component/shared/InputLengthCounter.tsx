import React from "react";

const InputLengthCounter: React.FC<{ length: number; maxLength?: number }> = ({
  length,
  maxLength = 20,
}) => {
  return (
    <span className="length-counter">
      {length}/{maxLength}
    </span>
  );
};

export default InputLengthCounter;
