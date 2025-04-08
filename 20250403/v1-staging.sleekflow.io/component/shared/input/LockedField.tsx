import { Image } from "semantic-ui-react";
import LockIcon from "../../../assets/images/permission-lock.svg";
import React from "react";

export function LockedField(props: { text: string }) {
  return (
    <div className="field locked">
      <input id={"updatedStaffRole"} value={props.text} disabled />
      <Image src={LockIcon} />
    </div>
  );
}
