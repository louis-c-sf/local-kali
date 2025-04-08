import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import { copyToClipboard } from "../../../utility/copyToClipboard";
import styles from "./ShopifyWidget.module.css";
import { Image } from "semantic-ui-react";
import CopyImg from "../../../assets/images/copy.svg";
import React from "react";
import { useTranslation } from "react-i18next";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export function CopyField(props: {
  value: string;
  text?: string;
  showText?: boolean;
}) {
  const { value, text, showText = false } = props;
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();

  function copyText() {
    copyToClipboard(props.value);
    flash(t("form.field.copy.copied"));
  }

  return (
    <div className={styles.copyField}>
      <Image onClick={copyText} src={CopyImg} />
      {showText && (
        <a
          className={styles.hyperlink}
          href={htmlEscape(value)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {text ?? t("chat.shopify.clickHere")}
        </a>
      )}
    </div>
  );
}
