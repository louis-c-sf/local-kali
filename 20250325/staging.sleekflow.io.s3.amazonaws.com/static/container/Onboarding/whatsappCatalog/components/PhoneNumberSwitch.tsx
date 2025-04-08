import React, { useState } from "react";
import { Checkbox } from "semantic-ui-react";

export default function PhoneNumberSwitch(props: {
  onSwitchChange: (checked: boolean) => void;
  loading: boolean;
  defaultChecked?: boolean;
}) {
  const { onSwitchChange, loading, defaultChecked = false } = props;
  const [checked, setChecked] = useState(defaultChecked);

  const click = async () => {
    try {
      await onSwitchChange(!checked);
      setChecked(!checked);
    } catch (e) {
      console.error(`onSwitchChange click`, e);
    }
  };

  return (
    <Checkbox
      checked={checked}
      onClick={loading ? undefined : click}
      toggle
      disabled={loading}
    />
  );
}
