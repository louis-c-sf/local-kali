import React, { useEffect, useState } from "react";
import { Modal, Input, InputOnChangeData } from "semantic-ui-react";
import { Button } from "component/shared/Button/Button";
import styles from "./AddSampleContentModal.module.css";
import UploadSampleHeader from "./UploadSampleHeader";
import { SampleHeaderHandleType } from "features/WhatsappCloudAPI/models/WhatsappCloudAPITemplateType";
import { useTranslation } from "react-i18next";
import { FieldError } from "component/shared/form/FieldError";
import { InfoTooltip } from "component/shared/popup/InfoTooltip";
import { Icon } from "component/shared/Icon/Icon";
import { getMatchedVariables } from "lib/utility/getMatchedVariables";
import { URL_VARIABLE_TOKEN } from "./CloudApi/EditTemplate";

export default function AddSampleContentModal(props: {
  wabaId: string;
  isCreateStatus: boolean;
  onCancel: () => void;
  updateHeaderSample: (sample: SampleHeaderHandleType) => void;
  clearHeaderSample: () => void;
  updateBodySample: (samples: string[]) => void;
  headerFormat: string;
  bodyText: string;
  headerError?: string;
  bodyError?: string;
  isSubmitting: boolean;
  submitForm: () => void;
  buttonTexts: string[];
  updateButtonUrlSample: (sample: { [key in string]: string }) => void;
  buttonUrlError?: string;
}) {
  const {
    wabaId,
    isCreateStatus,
    onCancel,
    updateHeaderSample,
    clearHeaderSample,
    updateBodySample,
    headerFormat,
    bodyText,
    headerError,
    bodyError,
    isSubmitting,
    submitForm,
    buttonTexts,
    updateButtonUrlSample,
    buttonUrlError,
  } = props;
  const matchedVariables = getMatchedVariables(bodyText);
  const [variables, setVariables] = useState<{ [key: string]: string }>({});
  const [message, setMessage] = useState<(string | JSX.Element)[]>([]);
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const matchedVariableButton = buttonTexts?.filter((text) =>
    text.includes(URL_VARIABLE_TOKEN)
  );
  const [buttonUrlVariables, setButtonUrlVariables] = useState<{
    [key: string]: string;
  }>({});

  const getSampleMessageArr = (vars: { [key: string]: string }) => {
    return bodyText.split(/(\{\{[\d]+\}\})/).map((text, i) => {
      const currentVariable = Object.keys(vars).find((key) => key === text);
      if (!currentVariable) return text;
      return (
        <span className={styles.variable} key={i}>
          {vars[currentVariable] || currentVariable}
        </span>
      );
    });
  };

  const onChangeVariable =
    (key: string) => (_: any, data: InputOnChangeData) => {
      const newVariables = { ...variables, [key]: data.value };
      setVariables(newVariables);
      const newMessage = getSampleMessageArr(newVariables);
      setMessage(newMessage);
      const variablesSampleArr = newMessage.filter(
        (text) => typeof text !== "string"
      ) as JSX.Element[];
      const bodySample = variablesSampleArr.map((text) =>
        text.props.children.replace(/\{\{[\d]+\}\}/, "")
      );
      updateBodySample(bodySample);
    };

  const onChangeButtonVariable =
    (key: string) => (_: any, data: InputOnChangeData) => {
      const newVariables = { ...buttonUrlVariables, [key]: data.value };
      setButtonUrlVariables(newVariables);
      updateButtonUrlSample(newVariables);
    };

  useEffect(() => {
    const newVariables = matchedVariables.reduce((acc, cur) => {
      return { ...acc, [cur[0]]: "" };
    }, {});
    setVariables(newVariables);
    const newMessage = getSampleMessageArr(newVariables);
    setMessage(newMessage);
  }, []);

  return (
    <Modal open={true} className={styles.sampleModal}>
      <h4 className={styles.header}>
        {t("settings.template.modal.addSample.title")}
      </h4>
      <div className={styles.body}>
        <div className={styles.description}>
          {t("settings.template.modal.addSample.description")}
        </div>
        {(headerFormat === "IMAGE" ||
          headerFormat === "VIDEO" ||
          headerFormat === "DOCUMENT") &&
          isCreateStatus && (
            <UploadSampleHeader
              format={headerFormat}
              wabaId={wabaId}
              updateSample={updateHeaderSample}
              clearSample={clearHeaderSample}
              error={headerError}
              setIsUploading={setIsUploading}
            />
          )}
        {matchedVariables.length > 0 && (
          <>
            <div className={styles.messageSampleTitleWrapper}>
              <InfoTooltip
                placement={"right"}
                trigger={
                  <span>
                    <span className={styles.messageSampleTitle}>
                      {t("settings.template.form.message.sample.title")}
                    </span>
                    <Icon type={"info"} />
                  </span>
                }
              >
                {t("settings.template.form.message.sample.tooltip")}
              </InfoTooltip>
            </div>
            <div className={styles.messageSampleText}>{message}</div>
            {matchedVariables.map((variable, index) => (
              <div className={styles.messageSampleVariable} key={variable[0]}>
                <label>{variable[0]}</label>
                <Input
                  placeholder={t(
                    "settings.template.form.message.sample.placeholder",
                    { variable: variable[0] }
                  )}
                  disabled={isCreateStatus === false}
                  onChange={onChangeVariable(variable[0])}
                  value={variables[variable[0]]}
                />
              </div>
            ))}
            <FieldError
              text={bodyError}
              className={styles.messageSampleError}
            />
          </>
        )}
        {matchedVariableButton.length > 0 && (
          <>
            <div className={styles.buttonUrlSampleTitle}>
              {t("settings.template.form.buttons.callToAction.sample.title")}
            </div>
            <div className={styles.buttonUrlSampleDescription}>
              {t(
                "settings.template.form.buttons.callToAction.sample.description"
              )}
            </div>
            {matchedVariableButton.map((variable, index) => (
              <Input
                fluid
                placeholder={variable.replace(URL_VARIABLE_TOKEN, "/example")}
                disabled={isCreateStatus === false}
                onChange={onChangeButtonVariable(variable)}
                value={buttonUrlVariables[variable]}
              />
            ))}
            <FieldError
              text={buttonUrlError}
              className={styles.buttonUrlSampleError}
            />
          </>
        )}
      </div>
      <div className={styles.footer}>
        <Button
          className={styles.cancelBtn}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {t("settings.template.modal.addSample.button.cancel")}
        </Button>
        <Button
          primary
          onClick={submitForm}
          loading={isSubmitting}
          disabled={isSubmitting || isUploading}
        >
          {t("settings.template.modal.addSample.button.confirm")}
        </Button>
      </div>
    </Modal>
  );
}
