import React, { useEffect, useState } from "react";
import { Checkbox, Image, Table } from "semantic-ui-react";
import { ProfileMediaFileType } from "../../../../types/IndividualProfileType";
import styles from "../ProfileMediaContent.module.css";
import DownloadIcon from "../../../../assets/images/download-underline.svg";
import Forward from "../../../../assets/images/forward.svg";
import moment from "moment";
import { baseName } from "../../../../utility/baseName";
import { GET_ATTACHMENT_LINK } from "../../../../api/apiPath";
import { downloadAttachmentViaGet } from "../../../../api/apiRequest";
import { useTranslation } from "react-i18next";
import { getUploadedAttachment } from "../../../../api/Broadcast/getUploadedAttachment";

interface BodyProps {
  files: ProfileMediaFileType[];
  selectedFiles: ProfileMediaFileType[];
  setSelectedFiles: React.Dispatch<
    React.SetStateAction<ProfileMediaFileType[]>
  >;
  forwardsEnabled: boolean;
}

const MediaTableBody = (props: BodyProps) => {
  const { files, selectedFiles, setSelectedFiles } = props;
  const { t } = useTranslation();

  function handleCellSelected(
    e: React.MouseEvent,
    selectedRow: ProfileMediaFileType
  ) {
    e.stopPropagation();
    e.preventDefault();
    const selectedFileIds = selectedFiles.map((file) => file.fileId);
    const foundIndex = selectedFileIds.indexOf(selectedRow.fileId);
    let selectionExtended = [];

    if (foundIndex === -1) {
      selectionExtended = [
        ...selectedFiles,
        {
          ...selectedRow,
        },
      ];
    } else {
      selectedFiles.splice(foundIndex, 1);
      selectionExtended = [...selectedFiles];
    }
    setSelectedFiles(selectionExtended);
  }

  return (
    <>
      {files.length === 0 ? (
        <div className={styles.noDataHint}>
          {t("profile.individual.media.grid.hint")}
        </div>
      ) : (
        <>
          {files.map((file: ProfileMediaFileType, index: number) => {
            return (
              <TableRow
                {...{
                  key: `media${file.fileId}-${index}`,
                  file,
                  handleCellSelected,
                  selectedFiles,
                  forwardsEnabled: props.forwardsEnabled,
                }}
              />
            );
          })}
        </>
      )}
    </>
  );
};

function TableRow(props: {
  file: ProfileMediaFileType;
  handleCellSelected: (e: React.MouseEvent, file: ProfileMediaFileType) => void;
  selectedFiles: ProfileMediaFileType[];
  forwardsEnabled: boolean;
}) {
  const { file, handleCellSelected, selectedFiles } = props;
  const [imgSrc, setImgSrc] = useState("");
  const basename = baseName(file.filename).replace(/\#/gi, "").split("?")[0];
  const selectedFileIds =
    selectedFiles.length > 0 ? selectedFiles.map((row) => row.fileId) : [];

  const handleFileSizeUnit = (
    bytes: number | string,
    decimals: number = 2
  ): string => {
    if (typeof bytes === "string") return "N/A";
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };
  const handleFileName = (): string => {
    const extension = file.mimeType.split("/")[1];

    return !basename.includes(".") ? `${basename}.${extension}` : basename;
  };

  const handleDownload = (file: ProfileMediaFileType) => {
    downloadAttachmentViaGet(
      GET_ATTACHMENT_LINK.replace("{attachmentType}", "message").replace(
        "{fileId}",
        file.fileId
      ),
      basename,
      true
    );
  };

  useEffect(() => {
    getUploadedAttachment(file.fileId, "message", basename).then((res) => {
      setImgSrc(res);
    });
  }, [file.fileId]);

  return (
    <Table.Row key={file.fileId}>
      <Table.Cell className="checkbox">
        <div className={styles.checkboxWrap}>
          <Checkbox
            checked={selectedFileIds.includes(file.fileId as string)}
            onClick={(e: React.MouseEvent) => handleCellSelected(e, file)}
          />
        </div>
      </Table.Cell>
      <Table.Cell>
        {file.mimeType.includes("image") && <Image src={imgSrc} size="tiny" />}
        {!file.mimeType.includes("image") && (
          <div className={styles.file}>{handleFileName()}</div>
        )}
      </Table.Cell>
      <Table.Cell className={styles.senderCell}>{file.sender}</Table.Cell>
      <Table.Cell>{handleFileSizeUnit(file.fileSize)}</Table.Cell>
      <Table.Cell className={styles.dateCell}>
        {moment(file.date).utc().format("ll")}
      </Table.Cell>
      <Table.Cell className={`${styles.downloadCell} downloadCell`}>
        <a onClick={() => handleDownload(file)}>
          <Image src={DownloadIcon} size="mini" />
        </a>
      </Table.Cell>
      {props.forwardsEnabled && (
        <Table.Cell className={styles.forwardCell}>
          <Image src={Forward} size="mini" />
        </Table.Cell>
      )}
    </Table.Row>
  );
}

export default MediaTableBody;
