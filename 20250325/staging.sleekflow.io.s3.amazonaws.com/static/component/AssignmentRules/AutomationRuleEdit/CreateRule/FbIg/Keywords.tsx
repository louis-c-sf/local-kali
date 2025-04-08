import React from "react";
import { Dropdown, Image } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";
import InfoIcon from "../../../../../assets/images/info_gray.svg";
import styles from "./Keywords.module.css";
import { InfoTooltip } from "../../../../shared/popup/InfoTooltip";

export const Keywords = (props: {
  keywords: string[];
  setKeywords: (keywords: string[]) => void;
}) => {
  const { keywords, setKeywords } = props;
  const { t } = useTranslation();
  const removeKeyword = (selectedValue: string) => {
    setKeywords(
      keywords.includes(selectedValue)
        ? keywords.filter((word) => word !== selectedValue)
        : keywords
    );
  };

  const handleClearAll = () => {
    setKeywords([]);
  };

  const handleAddItem = (value: string) => {
    let newKeywords = [...keywords];
    if (!keywords.includes(value)) {
      newKeywords = [...keywords, value];
    }
    setKeywords(newKeywords);
  };

  const getChoices = () => {
    return keywords.flat(1).map((v, k) => ({
      value: v,
      text: v,
      key: k,
    }));
  };

  return (
    <div className={styles.keywords}>
      <label>
        {t("automation.rule.field.conditions.postComment.keywords.label")}
        <span className={styles.optional}>
          ({t("automation.rule.field.conditions.postComment.keywords.optional")}
          )
        </span>
      </label>
      <div className={styles.hintContainer}>
        <div className={styles.hint}>
          {t("automation.rule.field.conditions.postComment.keywords.hint")}
        </div>
        <InfoTooltip
          placement={"right"}
          trigger={<Image src={InfoIcon} size={"mini"} />}
        >
          <Trans i18nKey="automation.rule.field.conditions.postComment.keywords.tooltip">
            By default, the actions will trigger no matter what users commented
            on the post.
            <br />
            <br />
            You can specify keywords to trigger the actions only when users
            commented with the keywords
          </Trans>
        </InfoTooltip>
      </div>
      <div className={styles.dropdownContainer}>
        <Dropdown
          fluid
          allowAdditions
          search
          onAddItem={(_, data) => {
            handleAddItem(data.value as string);
          }}
          onChange={(_, data) => {
            setKeywords(data.value as string[]);
          }}
          selection
          upward={false}
          value={keywords}
          multiple
          placeholder={t(
            "automation.rule.field.conditions.postComment.keywords.placeholder"
          )}
          noResultsMessage={t("form.field.tags.noResults")}
          options={getChoices()}
        />
        {keywords.length > 0 && (
          <span className={styles.clearAll} onClick={handleClearAll}>
            {t("form.button.clearAll")}
          </span>
        )}
      </div>
    </div>
  );
};
