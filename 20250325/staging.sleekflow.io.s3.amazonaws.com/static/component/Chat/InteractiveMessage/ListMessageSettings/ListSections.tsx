import React from "react";
import { FieldArray, FieldArrayRenderProps, useFormikContext } from "formik";
import { useTranslation } from "react-i18next";
import { Form, Image } from "semantic-ui-react";
import {
  initialValues,
  InteractiveMessageValues,
} from "../InteractiveMessageSchema";
import styles from "./ListMessageSettings.module.css";
import { Button } from "component/shared/Button/Button";
import ListOptions from "./ListOptions";
import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import DeleteBin from "assets/images/delete-bin.svg";

const SECTION_TITLE_MAX_LENGTH = 24;
const MAX_NUMBER_OF_OPTIONS = 10;

export default function ListSections({ push, remove }: FieldArrayRenderProps) {
  const { t } = useTranslation();
  const { values, setFieldValue } =
    useFormikContext<InteractiveMessageValues>();

  const optionCount =
    values.listMessage?.sections?.flatMap((s) => s.options).length || 0;
  const canAddMoreOption = optionCount < MAX_NUMBER_OF_OPTIONS;

  function handleAddSection() {
    if (canAddMoreOption) {
      push({ ...initialValues.listMessage?.sections[0] });
    }
  }

  return (
    <>
      {values.listMessage?.sections.map((section, index, allSections) => {
        const currentSection = `listMessage.sections.${index}`;
        return (
          <div key={currentSection} className={styles.wrapper}>
            <Form.Field>
              <label>
                {t("form.interactiveMessage.field.listMessage.sectionTitle")}
                <span className={styles.optional}>
                  ({t("form.interactiveMessage.optional")})
                </span>
              </label>
              <WordCountInput
                value={section.title}
                maxLength={SECTION_TITLE_MAX_LENGTH}
                onChange={(value) =>
                  setFieldValue(`${currentSection}.title`, value)
                }
              />
            </Form.Field>
            <FieldArray name={`${currentSection}.options`}>
              {(arrayHelpers) => (
                <ListOptions
                  sectionIndex={index}
                  canAddMoreOption={canAddMoreOption}
                  {...arrayHelpers}
                />
              )}
            </FieldArray>
            {allSections.length > 1 && (
              <div className={styles.deleteSectionContainer}>
                <Button
                  className={styles.deleteSectionButton}
                  onClick={() => remove(index)}
                >
                  <Image src={DeleteBin} />
                  {t("form.interactiveMessage.field.listMessage.deleteSection")}
                </Button>
              </div>
            )}
          </div>
        );
      })}
      <Button primary onClick={handleAddSection} disabled={!canAddMoreOption}>
        {t("form.interactiveMessage.field.listMessage.addSection")}
      </Button>
    </>
  );
}
