import React, { useEffect, useState } from "react";
import { ViberConfigType } from "../../../types/CompanyType";
import { QrCodeActivated } from "../QrCodeActivated";
import { submitGenerateViberQrCode } from "../../../api/Channel/submitGenerateViberQrCode";

export function ViberQrCodeActivated(props: {
  channel: ViberConfigType;
  onRest?: () => void;
}) {
  const { channel, onRest } = props;

  const [qrCodeData, setQrCodeData] = useState<string>();

  useEffect(() => {
    submitGenerateViberQrCode(channel.uri)
      .then((response) => {
        setQrCodeData(response.qrcodeBase64);
      })
      .catch(console.error);
  }, [channel.uri]);

  return (
    <QrCodeActivated
      url={channel.viberDeeplink}
      qrCodeContents={qrCodeData}
      vendor={"Viber"}
      onRest={onRest}
    />
  );
}
