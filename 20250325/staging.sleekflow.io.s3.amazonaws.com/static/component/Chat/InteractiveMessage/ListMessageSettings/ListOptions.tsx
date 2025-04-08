import React from "react";
import { FieldArrayRenderProps, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Button, Form, Icon } from "semantic-ui-react";
import SortControl from "component/shared/SortControl/SortControl";
import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import styles from "./ListMessageSettings.module.css";
import { InteractiveMessageValues } from "../InteractiveMessageSchema";

const OPTION_TITLE_MAX_LENGTH = 24;
const OPTION_DESCRIPTION_MAX_LENGTH = 72;

export default function ListOptions({
  sectionIndex,
  canAddMoreOption,
  push,
  remove,
  swap,
}: FieldArrayRenderProps & {
  sectionIndex: number;
  canAddMoreOption: boolean;
}) {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<InteractiveMessageValues>();

  function handleAddOption() {
    if (canAddMoreOption) {
      push({ name: "", description: "" });
    }
  }

  const currentSection = `listMessage.sections.${sectionIndex}`;

  return (
    <>
      {values.listMessage?.sections[sectionIndex]?.options.map(
        (option, optionIndex, allOptions) => (
          <div
            className={styles.optionWrapper}
            key={`section.${sectionIndex}.option.${optionIndex}`}
          >
            {optionIndex === 0 && (
              <div className={styles.optionGrid}>
                <p className={styles.optionTitle}>
                  {t("form.interactiveMessage.field.listMessage.optionName")}
                </p>
                <p>
                  {t(
                    "form.interactiveMessage.field.listMessage.optionDescription"
                  )}
                  <span className={styles.optional}>
                    ({t("form.interactiveMessage.optional")})
                  </span>
                </p>
              </div>
            )}
            <div className={styles.optionGrid}>
              <SortControl
                index={optionIndex}
                totalItems={allOptions.length}
                onSort={(from, to) => swap(from, to)}
              />

              <Form.Field className={styles.optionField}>
                <WordCountInput
                  value={option.name}
                  maxLength={OPTION_TITLE_MAX_LENGTH}
                  onChange={(value) =>
                    setFieldValue(
                      `${currentSection}.options.${optionIndex}.name`,
                      value
                    )
                  }
                />
              </Form.Field>

              <Form.Field className={styles.optionField}>
                <WordCountInput
                  value={option.description || ""}
                  maxLength={OPTION_DESCRIPTION_MAX_LENGTH}
                  onChange={(value) =>
                    setFieldValue(
                      `${currentSection}.options.${optionIndex}.description`,
                      value
                    )
                  }
                />
              </Form.Field>

              <button
                className={styles.closeButton}
                onClick={() => remove(optionIndex)}
              >
                <Icon name="close" className="lg" />
              </button>
            </div>
          </div>
        )
      )}
      <Button
        className={`fluid ${styles.addButton}`}
        onClick={handleAddOption}
        disabled={!canAddMoreOption}
      >
        + {t("form.interactiveMessage.field.listMessage.addOption")}
      </Button>
    </>
  );
}
