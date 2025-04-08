import { Button } from "component/shared/Button/Button";
import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import produce from "immer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Form, Image } from "semantic-ui-react";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "types/AutomationActionType";
import { initialInteractiveMessageValues } from "./SendInteractiveMessageForm";
import DeleteBin from "assets/images/delete-bin.svg";
import ListMessageOptions from "./ListMessageOptions";
import styles from "./SendInteractiveMessageForm.module.css";

const MAX_NUMBER_OF_OPTIONS = 10;

export default function ListMessageSections({
  action,
  setAction,
}: {
  action: SendMessageAutomationActionType;
  setAction: (action: AutomationActionType) => void;
}) {
  const { t } = useTranslation();

  const optionCount =
    action.sendInteractiveMessageState?.listMessage?.sections?.flatMap(
      (s) => s.options
    ).length ?? 0;
  const canAddMoreOption = optionCount < MAX_NUMBER_OF_OPTIONS;

  function appendSection() {
    if (canAddMoreOption) {
      setAction(
        produce(action, (draft) => {
          if (draft.sendInteractiveMessageState?.listMessage?.sections) {
            draft.sendInteractiveMessageState?.listMessage?.sections.push({
              ...initialInteractiveMessageValues.listMessage.sections[0],
            });
          }
        })
      );
    }
  }

  function setSectionTitle(value: string, index: number) {
    setAction(
      produce(action, (draft) => {
        const activeSection =
          draft.sendInteractiveMessageState?.listMessage?.sections[index];

        if (activeSection) {
          activeSection.title = value;
        }
      })
    );
  }

  function removeSection(index: number) {
    setAction(
      produce(action, (draft) => {
        if (draft.sendInteractiveMessageState?.listMessage?.sections) {
          draft.sendInteractiveMessageState.listMessage.sections.splice(
            index,
            1
          );
        }
      })
    );
  }

  return (
    <>
      {action.sendInteractiveMessageState?.listMessage?.sections?.map(
        (section, sectionIndex, allSections) => {
          return (
            <div key={sectionIndex} className={styles.wrapper}>
              <Form.Field>
                <label>
                  {t("form.interactiveMessage.field.listMessage.sectionTitle")}
                  <span className={styles.optional}>
                    ({t("form.interactiveMessage.optional")})
                  </span>
                </label>
                <WordCountInput
                  value={section.title}
                  maxLength={24}
                  onChange={(value) => setSectionTitle(value, sectionIndex)}
                />
              </Form.Field>
              <ListMessageOptions
                action={action}
                setAction={setAction}
                sectionIndex={sectionIndex}
                canAddMoreOption={canAddMoreOption}
              />
              {allSections.length > 1 && (
                <div className={styles.deleteSectionContainer}>
                  <Button
                    className={styles.deleteSectionButton}
                    onClick={() => removeSection(sectionIndex)}
                  >
                    <Image src={DeleteBin} />
                    {t(
                      "form.interactiveMessage.field.listMessage.deleteSection"
                    )}
                  </Button>
                </div>
              )}
            </div>
          );
        }
      )}
      <Button primary onClick={appendSection} disabled={!canAddMoreOption}>
        {t("form.interactiveMessage.field.listMessage.addSection")}
      </Button>
    </>
  );
}
