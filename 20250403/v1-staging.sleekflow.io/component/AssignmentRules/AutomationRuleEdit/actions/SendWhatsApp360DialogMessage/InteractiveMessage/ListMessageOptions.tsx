import WordCountInput from "component/shared/input/WordCountInput/WordCountInput";
import SortControl from "component/shared/SortControl/SortControl";
import produce from "immer";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Form, Icon } from "semantic-ui-react";
import {
  AutomationActionType,
  SendMessageAutomationActionType,
} from "types/AutomationActionType";
import styles from "./SendInteractiveMessageForm.module.css";
import { moveItem } from "component/AssignmentRules/helpers/swapOrderables";

export default function ListMessageOptions({
  action,
  setAction,
  sectionIndex,
  canAddMoreOption,
}: {
  action: SendMessageAutomationActionType;
  setAction: (action: AutomationActionType) => void;
  sectionIndex: number;
  canAddMoreOption: boolean;
}) {
  const { t } = useTranslation();

  function appendOption() {
    if (canAddMoreOption) {
      setAction(
        produce(action, (draft) => {
          draft.sendInteractiveMessageState?.listMessage?.sections[
            sectionIndex
          ]?.options.push({ name: "", description: "" });
        })
      );
    }
  }

  function swapOptions(fromIndex: number, toIndex: number) {
    setAction(
      produce(action, (draft) => {
        if (
          draft.sendInteractiveMessageState?.listMessage?.sections[sectionIndex]
            ?.options
        ) {
          draft.sendInteractiveMessageState.listMessage.sections[
            sectionIndex
          ].options = moveItem(
            draft.sendInteractiveMessageState!.listMessage!.sections[
              sectionIndex
            ].options,
            fromIndex,
            toIndex
          );
        }
      })
    );
  }

  function removeOption(index: number) {
    setAction(
      produce(action, (draft) => {
        if (
          draft.sendInteractiveMessageState?.listMessage?.sections[sectionIndex]
        ) {
          draft.sendInteractiveMessageState.listMessage.sections[
            sectionIndex
          ].options.splice(index, 1);
        }
      })
    );
  }

  function setOptionTitle(value: string, index: number) {
    setAction(
      produce(action, (draft) => {
        draft.sendInteractiveMessageState!.listMessage!.sections[
          sectionIndex
        ].options[index].name = value;
      })
    );
  }

  function setOptionDescription(value: string, index: number) {
    setAction(
      produce(action, (draft) => {
        draft.sendInteractiveMessageState!.listMessage!.sections[
          sectionIndex
        ].options[index].description = value;
      })
    );
  }

  return (
    <>
      {action.sendInteractiveMessageState?.listMessage?.sections[
        sectionIndex
      ]?.options.map((option, optionIndex, allOptions) => (
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
              onSort={(from, to) => swapOptions(from, to)}
            />

            <Form.Field className={styles.optionField}>
              <WordCountInput
                value={option.name}
                maxLength={24}
                onChange={(value) => setOptionTitle(value, optionIndex)}
              />
            </Form.Field>

            <Form.Field className={styles.optionField}>
              <WordCountInput
                value={option.description || ""}
                maxLength={72}
                onChange={(value) => setOptionDescription(value, optionIndex)}
              />
            </Form.Field>

            <button
              className={styles.closeButton}
              onClick={() => removeOption(optionIndex)}
            >
              <Icon name="close" className="lg" />
            </button>
          </div>
        </div>
      ))}
      <Button
        onClick={appendOption}
        className={`fluid ${styles.addButton}`}
        disabled={!canAddMoreOption}
      >
        + {t("form.interactiveMessage.field.listMessage.addOption")}
      </Button>
    </>
  );
}
