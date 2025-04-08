import React, { useEffect, useRef, useState } from "react";
import { Button, Form, Header, Image } from "semantic-ui-react";
import TrackingCodeImg from "../assets/images/Tracking_code.svg";
import { useTranslation } from "react-i18next";
import { copyToClipboard } from "../utility/copyToClipboard";
import { useAppSelector } from "../AppRootContext";

interface TrackingCodeScriptProps {
  bgColor: string;
  fontColor: string;
  showHeader: boolean;
  showActionBtn: boolean;
}

export default TrackingCodeScript;

function TrackingCodeScript(props: TrackingCodeScriptProps) {
  const { bgColor, fontColor } = props;
  const company = useAppSelector((s) => s.company);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const { t } = useTranslation();
  const [copyStr, setCopyStr] = useState(`<!-- Start of SleekFlow Embed Code —->
  <script src="https://chat.sleekflow.io/embed_iframe.js" 
  data-id="travischatwidget"
  data-companyid="471a6289-b9b7-43c3-b6ad-395a1992baea" 
  type="text/javascript"></script>
  <!-- End of SleekFlow Embed Code -->`);
  useEffect(() => {
    if (company) {
      setCopyStr(`<!-- Start of SleekFlow Embed Code -->
        <script src="https://chat.sleekflow.io/embed_iframe.js" 
        data-id="travischatwidget"
        data-companyid="${company.id}"
        type="text/javascript"></script>
<!-- End of SleekFlow Embed Code -->`);
    }
  }, [company && company.id, props]);

  const copyText = () => {
    copyToClipboard(copyStr);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <Form className="script-code">
      <Form.Field>
        {props.showHeader && (
          <>
            <label>
              <div className="header">
                <Image src={TrackingCodeImg} />
                <Header as="h4">
                  {t("settings.liveChat.field.copy.label")}
                </Header>
              </div>
            </label>
            <div className="p2">{t("settings.liveChat.field.copy.hint")}</div>
          </>
        )}
        <textarea
          readOnly
          id="textarea"
          value={copyStr}
          className="code-display"
          ref={textAreaRef}
        />
      </Form.Field>
      {props.showActionBtn && (
        <div className="copy-text">
          <div className="copy-action">
            <Button
              content={t("form.button.copy")}
              className="button1"
              onClick={copyText}
            />
            {copySuccess && (
              <div className="p2">{t("form.field.copy.copied")}</div>
            )}
          </div>
          <span className="p2">
            <a
              href="https://docs.sleekflow.io/website-messenger"
              target="_blank"
              className="p2 link2"
            >
              {t("settings.liveChat.field.copy.help")}
            </a>
          </span>
        </div>
      )}
    </Form>
  );
}
