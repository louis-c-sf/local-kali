import React from "react";
import styles from "./TemplatesFilter.module.css";
import { Dropdown, Input } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { DropdownOptionType } from "component/Chat/ChannelFilterDropdown";
import {
  LanguagesMapping,
  WhatsappGenericNormalizedType,
} from "types/WhatsappTemplateResponseType";
import { getButtonName } from "component/Settings/SettingTemplates/Twilio/SettingTemplate";
import { Button } from "component/shared/Button/Button";
import { TemplateCategorySearchEnum } from "component/Settings/SettingTemplates/360Dialog/TemplatesFiltered/useCallbackableTemplatesSearch";
import { getCategory } from "component/Settings/SettingTemplates/CloudApi/EditTemplate";

const SUPPORTED_TYPES = ["NONE", "QUICK_REPLY", "CALL_TO_ACTION"] as const;

type ButtonType = typeof SUPPORTED_TYPES[number];

export function TemplatesFilter<
  T extends WhatsappGenericNormalizedType
>(props: {
  searchLanguage: string | undefined;
  searchButtonType: string | undefined;
  searchCategory?: TemplateCategorySearchEnum | undefined;
  onTemplateChange: (text: string) => void;
  onButtonTypeChange: (type: ButtonType) => void;
  onLanguageChanged: (value: string) => void;
  onCategoryChanged?: (value: TemplateCategorySearchEnum) => void;
  languages: string[];
  buttonTypes?: ButtonType[];
  onReset?: () => void;
  noGap?: boolean;
  noLabel?: boolean;
}) {
  const {
    onButtonTypeChange,
    onLanguageChanged,
    onReset,
    onTemplateChange,
    searchButtonType,
    searchLanguage,
    languages,
    noGap = false,
    noLabel = false,
    searchCategory,
    onCategoryChanged,
  } = props;

  const { t } = useTranslation();
  const categoryOpts = getCategory(t).map((category) => ({
    text: category.text,
    value: category.value,
  }));

  const languageChoices = languages.map((language, i) => ({
    text:
      LanguagesMapping.find((lang) => lang.value === language)?.label ??
      language,
    value: language,
    key: i,
  }));

  const buttonTypeList: DropdownOptionType[] = SUPPORTED_TYPES.map(
    (type, i) => ({
      key: i,
      text: getButtonName(t, type) as string,
      value: type,
    })
  ).filter((option) => {
    if (!props.buttonTypes) {
      return true;
    }
    return props.buttonTypes.includes(option.value);
  });

  return (
    <div
      className={`${styles.form} ${noGap ? styles.noGap : ""} ${
        noLabel ? styles.hideLabel : ""
      }`}
    >
      <div className={styles.control}>
        <div className={styles.label}>
          {t("chat.selectWhatsappTemplate.field.name.label")}
        </div>
        <div className={`${styles.input} ui input`}>
          <Input
            onChange={(_, data) => {
              onTemplateChange(data.value as string);
            }}
            icon={"search"}
            iconPosition={"left"}
            placeholder={t(
              "settings.templates.whatsapp360.filter.name.placeholder"
            )}
          />
        </div>
      </div>
      <div className={styles.control}>
        <div className={styles.label}>
          {t("chat.selectWhatsappTemplate.field.type.label")}
        </div>
        <div className={`${styles.input} ui input`}>
          <Dropdown
            selection
            fluid
            value={searchButtonType || ""}
            options={[
              {
                text: t("chat.selectWhatsappTemplate.field.type.placeholder"),
                value: "",
              },
              ...buttonTypeList,
            ]}
            onChange={(_, data) => {
              onButtonTypeChange(data.value as ButtonType);
            }}
            placeholder={t(
              "chat.selectWhatsappTemplate.field.type.placeholder"
            )}
          />
        </div>
      </div>
      <div className={styles.control}>
        <div className={styles.label}>
          {t("chat.selectWhatsappTemplate.field.language.label")}
        </div>
        <div className={`${styles.input} ui input`}>
          <Dropdown
            selection
            fluid
            value={searchLanguage || ""}
            options={[
              {
                text: t(
                  "chat.selectWhatsappTemplate.field.language.placeholder"
                ),
                value: "",
              },
              ...languageChoices,
            ]}
            placeholder={t(
              "chat.selectWhatsappTemplate.field.language.placeholder"
            )}
            onChange={(_, data) => {
              onLanguageChanged(data.value as string);
            }}
          />
        </div>
      </div>
      {searchCategory !== undefined && onCategoryChanged && (
        <div className={styles.control}>
          <div className={styles.label}>
            {t("chat.selectWhatsappTemplate.field.category.label")}
          </div>
          <div className={`${styles.input} ui input`}>
            <Dropdown
              selection
              fluid
              value={searchCategory || ""}
              options={[
                {
                  text: t(
                    "chat.selectWhatsappTemplate.field.category.placeholder"
                  ),
                  value: "",
                },
                ...categoryOpts,
              ]}
              placeholder={t(
                "chat.selectWhatsappTemplate.field.category.placeholder"
              )}
              onChange={(_, data) => {
                onCategoryChanged(data.value as TemplateCategorySearchEnum);
              }}
            />
          </div>
        </div>
      )}

      {props.onReset && (
        <div className={`${styles.control} ${styles.button}`}>
          <Button
            className={styles.reset}
            onClick={onReset}
            content={t("form.button.clearAll")}
          />
        </div>
      )}
    </div>
  );
}
