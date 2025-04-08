import React, { useEffect, useState } from "react";
import { TelegramConfigType } from "../../../types/CompanyType";
import { QrCodeActivated } from "../QrCodeActivated";
import { generateTelegramQrCode } from "../../../api/Channel/generateTelegramQrCode";

export function TelegramQrCodeActivated(props: {
  channel: TelegramConfigType;
  onRest?: () => void;
}) {
  const { channel, onRest } = props;
  const [codeContents, setCodeContents] = useState<string>();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setPending(true);
    generateTelegramQrCode(channel.telegramBotUserName)
      .then((response) => {
        setCodeContents(response.qrcodeBase64);
      })
      .catch(console.error)
      .finally(() => {
        setPending(false);
      });
  }, [channel.telegramBotUserName]);

  return (
    <QrCodeActivated
      url={channel.telegramDeeplink}
      qrCodeContents={codeContents}
      vendor={"Telegram"}
      onRest={onRest}
    />
  );
}
