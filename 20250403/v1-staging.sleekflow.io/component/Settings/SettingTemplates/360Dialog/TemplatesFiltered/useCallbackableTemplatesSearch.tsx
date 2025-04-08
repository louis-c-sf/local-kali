import { ButtonType } from "../../../../../features/Whatsapp360/API/ButtonType";
import React, { useState } from "react";
import { FilterType } from "./TemplatesFiltered";
import { CreateTemplateCategoryEnum } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";

type LoadPageInterface<TFilter extends {}> = (
  page: number,
  filter: TFilter,
  force?: boolean
) => Promise<void>;

export type TemplateCategorySearchEnum = CreateTemplateCategoryEnum | "";

export function useCallbackableTemplatesSearch<TFilter extends {}>(props: {
  loadPage: LoadPageInterface<FilterType>;
  channelId: number | undefined;
}) {
  const [templateName, setTemplateName] = useState("");
  const [language, setLanguage] = useState<string>("");
  const [buttonType, setButtonType] = useState<ButtonType>();
  const [category, setCategory] = useState<TemplateCategorySearchEnum>("");

  function getFilter(): FilterType {
    return {
      buttonType,
      language,
      templateSearch: templateName,
      category,
    };
  }

  const runSearchByTemplate = (text: string) => {
    setTemplateName(text);
    props.loadPage(1, {
      ...getFilter(),
      templateSearch: text,
    });
  };

  const runSearchByButton = (type: ButtonType) => {
    setButtonType(type);
    props.loadPage(1, {
      ...getFilter(),
      buttonType: type ?? "",
    });
  };

  const runSearchByLanguage = (value: string) => {
    setLanguage(value);
    props.loadPage(1, {
      ...getFilter(),
      language: value,
    });
  };

  const runSearchByCategory = (value: TemplateCategorySearchEnum) => {
    setCategory(value);
    props.loadPage(1, {
      ...getFilter(),
      category: value,
    });
  };

  return {
    templateName,
    language,
    buttonType,
    category,
    getFilter,
    runSearchByLanguage,
    runSearchByButton,
    runSearchByTemplate,
    runSearchByCategory,
  };
}
