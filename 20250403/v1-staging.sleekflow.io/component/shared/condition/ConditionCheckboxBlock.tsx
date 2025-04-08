import React from "react";
import { Checkbox } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import styles from "./ConditionCheckboxBlock.module.css";
import { ConditionNameType } from "../../../config/ProfileFieldMapping";

type LabelMappingType = {
  firstOption: { label: string; value: ConditionNameType };
  secondOption: { label: string; value: ConditionNameType };
};
export const ConditionCheckboxBlock = (props: {
  labelType: "hashtag" | "list";
  operatorLocal: ConditionNameType;
  setOperatorLocal: (operator: ConditionNameType) => void;
}) => {
  const { t } = useTranslation();
  const { operatorLocal, setOperatorLocal, labelType } = props;
  const labelMapping: Record<"list" | "hashtag", LabelMappingType> = {
    hashtag: {
      firstOption: {
        label: t("profile.condition.hashtag.ContainsAnyOr"),
        value: "ContainsAny",
      },
      secondOption: {
        label: t("profile.condition.hashtag.ContainsAllAnd"),
        value: "ContainsAll",
      },
    },
    list: {
      firstOption: {
        label: t("profile.condition.list.ContainsAnyOr"),
        value: "ContainsAny",
      },
      secondOption: {
        label: t("profile.condition.list.ContainsAllAnd"),
        value: "ContainsAll",
      },
    },
  };

  return (
    <div className={styles.conditionContainer}>
      <Checkbox
        label={labelMapping[labelType].firstOption.label}
        onClick={() =>
          setOperatorLocal(labelMapping[labelType].firstOption.value)
        }
        checked={operatorLocal === labelMapping[labelType].firstOption.value}
      />
      <Checkbox
        label={labelMapping[labelType].secondOption.label}
        onClick={() =>
          setOperatorLocal(labelMapping[labelType].secondOption.value)
        }
        checked={operatorLocal === labelMapping[labelType].secondOption.value}
      />
    </div>
  );
};
