import React from "react";
import { WhatsappQrCode } from "./WhatsappQrCode";
import { useAppSelector } from "../../../AppRootContext";
import { InActivatedHint } from "./InActivatedHint";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

const SettingWhatsappQrCode = () => {
  useRequireRBAC([PERMISSION_KEY.channelQRCodeManage]);

  const isQRCodeMappingEnabled = useAppSelector(
    (s) => s.company?.isQRCodeMappingEnabled
  );

  return isQRCodeMappingEnabled ? <WhatsappQrCode /> : <InActivatedHint />;
};
export default SettingWhatsappQrCode;
