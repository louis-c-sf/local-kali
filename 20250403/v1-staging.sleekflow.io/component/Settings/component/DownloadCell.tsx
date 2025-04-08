import * as React from "react";
import DownloadIcon from "../../../assets/tsx/icons/DownloadIcon";

export const DownloadCell = (props: {
  isEdit: boolean;
  handleSelectedDownload: () => {};
}) => {
  const { isEdit, handleSelectedDownload } = props;
  return (
    <div onClick={isEdit ? undefined : () => handleSelectedDownload()}>
      <DownloadIcon
        className={`downloadIcon ${isEdit ? "disabled" : "active"}`}
      />
    </div>
  );
};
