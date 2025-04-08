import React, { useEffect, useState } from "react";
import { Image } from "semantic-ui-react";
import { WhatsappTemplateComponentButtonType } from "../../types/WhatsappTemplateResponseType";
import { useTranslation } from "react-i18next";
import WhatsappImg from "../../assets/images/whatsapp-image.svg";
import styles from "./PreviewContent.module.css";

export function PreviewContent(props: {
  value: string;
  buttons?: Array<WhatsappTemplateComponentButtonType>;
  children?: JSX.Element;
  size?: "full" | "compact";
}) {
  const { value, buttons, size = "full" } = props;
  const { t } = useTranslation();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const elem = document.querySelector(`.${styles.langContent}`);
    setHeight(elem?.clientHeight ?? 0);
  }, [value]);

  function getPreviewStyles(size: "full" | "compact") {
    const classes = [styles.preview];
    if (size === "compact") {
      classes.push(styles.compact);
    }
    return classes;
  }

  return (
    <div className={`preview ${getPreviewStyles(size).join(" ")}`}>
      <div className={`header ${styles.header}`}>
        {t("settings.template.preview.header")}
      </div>
      {props.children && <div>{props.children}</div>}
      <div className={`content ${styles.content}`}>
        <Image src={WhatsappImg} />
        <div className="display">
          <div className={`lang-content ${styles.langContent}`}>
            <pre>{value}</pre>
          </div>
          {buttons && (
            <div className={`button-display ${styles.buttonDisplay}`}>
              {buttons.map((button, index) => (
                <div
                  key={`${button.type}_${index}`}
                  className={`button ${styles.button}`}
                >
                  {button.text}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
