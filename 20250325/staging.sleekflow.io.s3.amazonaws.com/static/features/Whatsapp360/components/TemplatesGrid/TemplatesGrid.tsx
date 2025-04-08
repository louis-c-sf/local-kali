import React from "react";
import styles from "./TemplatesGrid.module.css";
import { TemplateCard } from "./TemplateCard";
import {
  HandleTemplateSelectInterface,
  RenderTemplateActionsInterface,
} from "./contracts";
import {
  WhatsappTemplateCallbackActionType,
  CategoryEnum,
} from "../../../../types/WhatsappTemplateResponseType";
import { OptInContentType } from "../../models/OptInType";
import { CreateTemplateCategoryEnum } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

export type TemplateGridItemType = {
  id: string;
  template: OptInContentType;
  language: string;
  callbacks?: WhatsappTemplateCallbackActionType[];
  category: CreateTemplateCategoryEnum | CategoryEnum;
};

export function TemplatesGrid(props: {
  templates: TemplateGridItemType[];
  onSelect?: HandleTemplateSelectInterface;
  renderContextActions?: RenderTemplateActionsInterface;
  bookmarkable: boolean;
}) {
  return (
    <div className={styles.strip}>
      {props.templates.map((t) => (
        <TemplateCard
          templateId={t.id}
          category={t.category}
          language={t.language}
          template={t.template}
          onConfirm={props.onSelect}
          key={`${t.id}_${t.language}_${t.template.contentSid}`}
          renderContextActions={props.renderContextActions}
          bookmarkable={props.bookmarkable}
        />
      ))}
    </div>
  );
}
