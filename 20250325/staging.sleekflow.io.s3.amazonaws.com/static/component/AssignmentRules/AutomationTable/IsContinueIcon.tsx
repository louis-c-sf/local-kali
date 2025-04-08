import React from "react";
import DotIcon from "../../../assets/tsx/icons/DotIcon";

export const IsContinueIcon = (props: { isContinue: boolean }) => {
  const { isContinue } = props;

  return <DotIcon color={isContinue ? "#6EC072" : "#9E9E9E"} />;
};
