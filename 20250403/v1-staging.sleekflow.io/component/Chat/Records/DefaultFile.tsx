import React from "react";
import UploadedFileType, {
  UploadedFileProxyType,
} from "../../../types/UploadedFileType";
import { Icon, Label, Loader } from "semantic-ui-react";
import useFilePreview from "../../../lib/effects/useFilePreview";
export function getDownloadLink(fileId: string, baseName: string) {
  return `/attachment/file/message/${fileId}/${encodeURIComponent(
    baseName.replace(/%/g, "")
  )}`;
}
export default function DefaultFile(props: { uploadFile: UploadedFileType }) {
  const { fileId, filename } = props.uploadFile;
  const baseName = filename
    .substring(filename.lastIndexOf("/") + 1)
    .replace(/\#/g, "");

  if ((props.uploadFile as UploadedFileProxyType).proxyFile) {
    return (
      <ProxyDefaultFile
        uploadFile={props.uploadFile as UploadedFileProxyType}
      />
    );
  }

  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={getDownloadLink(fileId, filename)}
    >
      <Label className="file">
        <Icon name="file outline" />
        {baseName.length > 33 ? baseName.substring(0, 32) + "..." : baseName}
      </Label>
    </a>
  );
}

const ProxyDefaultFile = (props: { uploadFile: UploadedFileProxyType }) => {
  const contents = useFilePreview(props.uploadFile.proxyFile);

  return (
    <a href={contents.src}>
      <Label className="file">
        <Loader size={"mini"} active inline />
        <Icon name="file outline" />
        {props.uploadFile.proxyFile.name}
      </Label>
    </a>
  );
};
