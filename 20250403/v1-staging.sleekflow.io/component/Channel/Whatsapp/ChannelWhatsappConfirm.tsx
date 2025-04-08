import React, { useEffect, useState } from "react";
import { Button, Form, Icon, Image } from "semantic-ui-react";
import { POST_COMPANY_WHATSAPP_CHATAPI_RENAME } from "../../../api/apiPath";
import { postWithExceptions } from "../../../api/apiRequest";
import { iconFactory } from "../../Chat/hooks/useCompanyChannels";
import { FieldError } from "../../shared/form/FieldError";
import { isValidationError } from "../../ChannelConfirmModal";
import { useHistory } from "react-router";
import { useChannelValidators } from "../Forms/localizable/useChannelValidators";
import { Trans, useTranslation } from "react-i18next";
import { fetchCompany } from "../../../api/Company/fetchCompany";
import { useAppDispatch } from "../../../AppRootContext";

export default function ChannelWhatsappConfirm(props: {
  instanceId?: string;
  isDisplayCloseBtn: boolean;
  closeForm?: (e: React.MouseEvent) => void;
  isBeta: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const { instanceId, closeForm, isBeta } = props;
  const history = useHistory();
  const { t } = useTranslation();
  const loginDispatch = useAppDispatch();
  const { whatsappChatApiValidator } = useChannelValidators();

  const confirmName = async (e: React.MouseEvent) => {
    setLoading(true);
    try {
      const valuesValidated = whatsappChatApiValidator.validateSync({ name });
    } catch (e) {
      if (isValidationError(e)) {
        setErrMsg(e.message);
      }
      setLoading(false);
      return;
    }
    if (instanceId) {
      try {
        setErrMsg("");
        await postWithExceptions(
          POST_COMPANY_WHATSAPP_CHATAPI_RENAME.replace("{id}", instanceId),
          {
            param: {
              name: name,
              IsShowInWidget: true,
            },
          }
        );
        if (closeForm) {
          closeForm(e);
        }
        const res = await fetchCompany();
        loginDispatch({ type: "ADD_COMPANY", company: { ...res } });
        loginDispatch({ type: "SHOW_CHATAPI_GUIDE" });
        history.replace("/channels");
      } catch (e) {
        setErrMsg("Unable to rename the channel");
        console.error(`rename error: ${e}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="whatsapp-confirm">
      <div className="header">
        <Image src={iconFactory("whatsapp")} />
        <div className="header-content">
          {t("channels.whatsapp.scanned.header")}
        </div>
        {props.closeForm && (
          <Icon
            className="close-icon"
            name="delete"
            onClick={props.closeForm}
          />
        )}
      </div>

      <div className="content">
        <div className="header">
          <Trans i18nKey="channels.whatsapp.scanned.title">
            Please wait <span className="highlight">3-5 minutes</span> for the
            channels to start synchronising.
          </Trans>
        </div>
        <ol>
          <li>
            <Trans i18nKey="channels.whatsapp.scanned.points.charged">
              Keep your phone <span className="highlight">charged</span> and
              <span className="highlight">connected</span> to the internet.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="channels.whatsapp.scanned.points.connected">
              Do not use
              <span className="highlight">WhatsApp Web/ Desktop</span>
              simultaneously.
            </Trans>
          </li>
          <li>
            <Trans i18nKey="channels.whatsapp.scanned.points.synced">
              If you would like to retrieve your message history and contacts,
              please press <span className="highlight">sync history</span> under
              your added WhatsApp Channel. The process could take up to 6 hours.
            </Trans>
          </li>
        </ol>
        <Form className="form">
          <Form.Field>
            <label>{t("channels.whatsapp.scanned.channelName.label")}</label>
            <Form.Input
              value={name}
              placeholder={t(
                "channels.whatsapp.scanned.channelName.placeholder"
              )}
              onChange={(e) => setName(e.target.value)}
            />
            <FieldError text={errMsg} />
          </Form.Field>
          <div className="action">
            <Button
              primary
              disabled={name.trim() === ""}
              loading={loading}
              onClick={confirmName}
              content={t("channels.form.confirm.button.done")}
            />
          </div>
        </Form>
      </div>
    </div>
  );
}
