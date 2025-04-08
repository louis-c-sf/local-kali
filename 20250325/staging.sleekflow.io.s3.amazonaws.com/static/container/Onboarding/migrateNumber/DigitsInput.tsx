import React, { useRef } from "react";
import { Input } from "semantic-ui-react";
import styles from "./DigitsInput.module.css";
export const DigitsInput = (props: {
  digitNumber: number;
  isError?: boolean;
  resetError: () => void;
  code: string[];
  setCode: (code: string[]) => void;
}) => {
  const { digitNumber, isError = false, resetError, code, setCode } = props;
  const digitArray = [...Array(digitNumber).keys()];
  const containerRef = useRef<HTMLDivElement>(null);

  const handleInputChange =
    (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isError) {
        resetError();
      }
      if (e.target.value.length > 1) {
        return;
      }
      const newCode = [...code];
      newCode[index] = e.target.value;
      setCode(newCode);

      if (containerRef.current) {
        const inputs: HTMLInputElement[] = Array.from(
          containerRef.current.querySelectorAll(".ui.input input")
        );
        if (e.target.value !== "" && inputs[index + 1]) {
          inputs[index + 1].focus();
        }
      }
    };

  return (
    <div className={styles.container} ref={containerRef}>
      {digitArray.map((i) => (
        <Input
          key={`digit-input-${i}`}
          type="number"
          maxLength="1"
          value={code[i] ?? ""}
          onChange={handleInputChange(i)}
          className={isError ? "error" : ""}
        />
      ))}
    </div>
  );
};
