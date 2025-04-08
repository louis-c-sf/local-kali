import { Button } from "component/shared/Button/Button";
import React from "react";

export default function ConnectPhoneNumberButton(props: {
  disabled?: boolean;
  onClick: () => void;
  loading?: boolean;
  text: React.ReactElement;
  className?: string;
}) {
  const { disabled = false, onClick, text, loading = false, className } = props;
  return (
    <Button
      className={className}
      disabled={disabled}
      primary
      fluid
      centerText
      loading={loading}
      customSize={"mid"}
      onClick={disabled ? undefined : onClick}
    >
      {text}
    </Button>
  );
}
