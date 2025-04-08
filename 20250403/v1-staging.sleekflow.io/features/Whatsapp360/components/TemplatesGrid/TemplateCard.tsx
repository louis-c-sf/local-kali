import React, { useState } from "react";
import styles from "./TemplateCard.module.css";
import { useTranslation } from "react-i18next";
import Star from "../../../../assets/tsx/icons/Star";
import { HeaderComponentType } from "../../../../types/WhatsappTemplateResponseType";
import PlaceholderImg from "../../../../component/Chat/Messenger/SelectWhatsappTemplate/assets/placeholderImg.svg";
import {
  HandleTemplateSelectInterface,
  RenderTemplateActionsInterface,
} from "./contracts";
import { Dimmer } from "semantic-ui-react";
import { findClosestParent } from "../../../../utility/dom";
import { identical } from "ramda";
import { OptInContentType } from "../../models/OptInType";
import { TFunction } from "i18next";

const getCategoryCopy = (t: TFunction, category: string) => {
  const categoryCopyMap = {
    marketing: t("chat.selectWhatsappTemplate.marketing"),
    utility: t("chat.selectWhatsappTemplate.utility"),
    authentication: t("chat.selectWhatsappTemplate.authentication"),
  };
  return categoryCopyMap[category.toLowerCase()] || category;
};

export function TemplateCard(props: {
  templateId: string;
  category: string;
  template: OptInContentType;
  language: string;
  onConfirm?: HandleTemplateSelectInterface;
  renderContextActions?: RenderTemplateActionsInterface;
  bookmarkable: boolean;
}) {
  const {
    onConfirm,
    template,
    templateId,
    language,
    renderContextActions,
    category,
  } = props;
  const [hovered, setHovered] = useState(false);
  const [rootNode, setRootNode] = useState<HTMLDivElement | null>(null);
  const { i18n, t } = useTranslation();
  const templateLanguage = language ?? i18n.language;
  const buttons = template?.buttons ?? [];

  const goHovered = () => {
    setHovered(true);
  };

  const goUnhovered = (ev: React.MouseEvent) => {
    if (!rootNode) {
      return;
    }
    const isInside = findClosestParent(
      ev.relatedTarget as HTMLElement,
      identical(rootNode as HTMLElement)
    );
    if (isInside) {
      return;
    }
    setHovered(false);
  };

  return (
    <div
      className={`${styles.card} ${hovered ? "dimmed" : ""} dimmable`}
      onClick={
        onConfirm
          ? () => onConfirm(templateId, templateLanguage, template.contentSid)
          : undefined
      }
      onMouseOver={goHovered}
      onMouseOut={goUnhovered}
      ref={setRootNode}
    >
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <div className={styles.line}>{templateId}</div>
          <div className={styles.category}>{getCategoryCopy(t, category)}</div>
        </div>
        {props.bookmarkable && template.isBookmarked && (
          <Star
            className={`${styles.star} ${
              template.isBookmarked ? styles.solid : ""
            }`}
            solid={template.isBookmarked}
          />
        )}
      </div>
      <div className={styles.body}>
        {template.header && <TemplateHeader header={template.header} />}
        {template.content}
        {template.footer && (
          <div className={styles.footer}>{template.footer.text}</div>
        )}
      </div>
      {buttons.length > 0 && (
        <div className={styles.buttons}>
          {buttons.map((btn, i) => (
            <div
              key={i}
              children={<span>{btn.text}</span>}
              className={styles.button}
            />
          ))}
        </div>
      )}
      {renderContextActions && (
        <Dimmer
          className={styles.overlay}
          active={hovered}
          children={
            <div className={styles.overlayActions}>
              {renderContextActions(templateId, language)}
            </div>
          }
        />
      )}
    </div>
  );
}

function TemplateHeader(props: { header: HeaderComponentType }) {
  const { header } = props;
  return (
    <div className={styles.headerText}>
      {["IMAGE", "DOCUMENT", "VIDEO"].includes(header.format) ? (
        <img src={PlaceholderImg} />
      ) : (
        header.text
      )}
    </div>
  );
}
