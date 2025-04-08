import React from "react";
import { Button, Dimmer, Image, Loader } from "semantic-ui-react";
import { State } from "xstate";
import {
  QrAuthEvent,
  QrAuthGeneratorContext,
  QrAuthGeneratorStateSchema,
} from "./qrCodeGeneratorMachine";

export interface WhatsappQrCodeResponseType {
  result: string;
  instanceId?: string;
  isBeta?: boolean;
  qrcode?: string;
}

interface ChannelWhatsAppQrCodeGenProps {
  machine: State<
    QrAuthGeneratorContext,
    QrAuthEvent,
    QrAuthGeneratorStateSchema
  >;
  sendMachine: (event: QrAuthEvent) => void;
}

export default ChannelWhatsAppQrCodeGen;

function ChannelWhatsAppQrCodeGen(props: ChannelWhatsAppQrCodeGenProps) {
  const { machine } = props;

  return (
    <div className={"qr wrapper"}>
      <div className="qrCode">
        {machine.context.qrCode ? (
          <Image src={machine.context.qrCode} />
        ) : (
          <Dimmer active>{!machine.context.qrCode && <Loader active />}</Dimmer>
        )}
      </div>
    </div>
  );
}
