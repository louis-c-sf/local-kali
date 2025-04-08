import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { GET_ATTACHMENT_LINK } from "../api/apiPath";
import { downloadAttachmentViaGet } from "../api/apiRequest";

function AttachmentContainer() {
  const { attachmentType, fileId, fileName } = useParams<{
    attachmentType: string;
    fileId: string;
    fileName: string;
  }>();
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (attachmentType) {
      downloadAttachmentViaGet(
        GET_ATTACHMENT_LINK.replace("{attachmentType}", attachmentType).replace(
          "{fileId}",
          fileId
        ),
        fileName,
        true
      );
    }
  }, [attachmentType]);
  return <div ref={setRef}></div>;
}

export default AttachmentContainer;
