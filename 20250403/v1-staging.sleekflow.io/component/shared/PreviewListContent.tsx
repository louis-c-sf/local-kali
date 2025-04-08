import React from "react";
import { Icon, Image } from "semantic-ui-react";
import styles from "./PreviewContent.module.css";
import { useTranslation } from "react-i18next";
import WhatsappImg from "../../assets/images/whatsapp-image.svg";
import { ListMessageSection } from "component/Chat/InteractiveMessage/InteractiveMessageSchema";

export default function PreviewListContent({
  buttonText,
  sections,
  value,
}: {
  value: string;
  buttonText: string;
  sections: ListMessageSection[];
}) {
  const { t } = useTranslation();

  return (
    <div className={`preview ${styles.preview}`}>
      <div className={`header ${styles.header}`}>
        {t("settings.template.preview.header")}
      </div>
      <div className={`content ${styles.content}`}>
        <Image src={WhatsappImg} />
        <div className={styles.backdrop} />
        <div className={styles.listMessageDialog}>
          <p>{value}</p>
          <div className={styles.dialogButton}>
            <Icon name="list ul" />
            {buttonText}
          </div>
        </div>
        <div className={styles.bottomSheet}>
          <p className={styles.listTitle}>{buttonText}</p>
          {sections.map((section, index) => {
            return (
              <div key={index}>
                {section.title && (
                  <p className={styles.sectionTitle}>{section.title}</p>
                )}
                <ul>
                  {section.options
                    .filter((option) => option.name !== "")
                    .map((option, optionIndex) => (
                      <li key={optionIndex}>
                        <p>{option.name}</p>
                        {option.description && (
                          <p className={styles.optionDescription}>
                            {option.description}
                          </p>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
