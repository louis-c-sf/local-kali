import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Form } from "semantic-ui-react";
import { object, string, TestContext } from "yup";
import { useFormik } from "formik";
import styles from "./SendRequestContent.module.css";
import { Button } from "component/shared/Button/Button";
import SendRequestPreview from "./SendRequestPreview";
import AddLabelDropdown from "./AddLabelDropdown";
import { HashTagCountedType, HashTagType } from "types/ConversationType";
import AddTopicDropdown from "./AddTopicDropdown";
import { FieldError } from "../../../../../component/shared/form/FieldError";
import {
  FacebookOTNRequestParamType,
  SelectedTopicType,
} from "../../../models/FacebookOTNTypes";
import uuid from "uuid";
import { submitCreateOrUpdateHashTag } from "api/Company/submitCreateOrUpdateHashTag";
import { useAppSelector } from "AppRootContext";
import { equals } from "ramda";
import { submitFacebookOTNRequest } from "../../../API/submitFacebookOTNRequest";

const defaultFormValue = {
  topic: {} as SelectedTopicType,
  message: "",
  labels: [],
  inActivated: "",
};
const SendRequestContent = (props: {
  pageId: string | undefined;
  fbReceiverId: string | undefined;
  conversationId: string | undefined;
  onClose: () => void;
}) => {
  const { pageId = "" } = props;
  const { t } = useTranslation();
  const profile = useAppSelector((s) => s.profile, equals);
  const profileTags = profile.conversationHashtags;
  const [loading, setLoading] = useState(false);

  const formValidator = object().shape({
    topic: object().test(
      "topic",
      t("chat.facebookOTN.modal.sendRequest.form.topic.required"),
      function (this: TestContext, value: object) {
        if (Object.keys(value).length !== 0) {
          return true;
        }
        return false;
      }
    ),
    message: string()
      .ensure()
      .trim()
      .required(t("chat.facebookOTN.modal.sendRequest.form.message.required")),
  });
  const hasAppliedTags = (labels: HashTagCountedType[]) => {
    const appliedArr = labels.filter(
      (label) => profileTags.filter((tag) => tag.id === label.id).length > 0
    );
    if (appliedArr.length > 0) {
      const labelsStr = appliedArr
        .map((applied) => "'" + applied.hashtag + "'")
        .join(",");
      const errorMsg = t("form.addLabel.error", { labels: labelsStr });
      setErrors({ labels: errorMsg });
      return true;
    }
    return false;
  };

  const handleLabels = async (
    labels: HashTagCountedType[]
  ): Promise<string[]> => {
    let newIds: HashTagCountedType[] = [];
    const newLabels = labels.filter(
      (label: HashTagCountedType) => label.id === ""
    );
    newIds = await submitCreateOrUpdateHashTag(newLabels);

    const hashTagIds: string[] = [];
    labels.forEach((label) => {
      if (label.id === "") {
        hashTagIds.push(
          newIds.find((newId) => newId.hashtag === label.hashtag)?.id ?? ""
        );
      } else {
        hashTagIds.push(label.id);
      }
    });
    return hashTagIds;
  };

  const { setFieldValue, values, errors, submitForm, setErrors } = useFormik({
    initialValues: defaultFormValue,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: formValidator,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        let hasApplied = false;
        if (values.labels.length > 0) {
          hasApplied = hasAppliedTags(values.labels);
        }
        if (hasApplied) return;
        const hashTagIds: string[] = await handleLabels(values.labels);

        const param: FacebookOTNRequestParamType = {
          messageCheckSum: uuid(),
          topicId: values.topic.id,
          topic: values.topic.name,
          pageId,
          title: values.message,
          hashTagIds,
          facebookReceiverId: props.fbReceiverId ?? "",
          conversationId: props.conversationId,
        };
        const result = await submitFacebookOTNRequest(param);
        if (result.permissionNotEnabled && !result.isFacebookOTNRequestSent) {
          setErrors({
            inActivated: t(
              "chat.facebookOTN.modal.sendRequest.form.inActivatedError"
            ),
          });
        } else {
          props.onClose();
        }
      } catch (e) {
        console.error("onSubmit e: ", e);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.title}>
          {t("chat.facebookOTN.modal.sendRequest.title")}
        </div>
        <div className={styles.description}>
          {t("chat.facebookOTN.modal.sendRequest.description")}
        </div>
        <Form id="signupInfo" className={styles.form}>
          <Form.Field id="topic" className={styles.topic}>
            <label htmlFor="topic">
              {t("chat.facebookOTN.modal.sendRequest.form.topic.label")}
              <span className={styles.topicHint}>
                {t("chat.facebookOTN.modal.sendRequest.form.topic.hint")}
              </span>
            </label>
            <AddTopicDropdown
              pageId={pageId}
              setSelectedTopic={(topic: SelectedTopicType) =>
                setFieldValue("topic", topic)
              }
              selectedTopic={values.topic}
              error={errors.topic}
            />
          </Form.Field>
          <Form.Field className={styles.message}>
            <label htmlFor="message">
              {t("chat.facebookOTN.modal.sendRequest.form.message.label")}
            </label>
            <textarea
              id="message"
              value={values.message}
              onChange={(e) => setFieldValue("message", e.target.value)}
              data-gramm_editor="false"
              placeholder={t(
                "chat.facebookOTN.modal.sendRequest.form.message.placeholder"
              )}
              maxLength={65}
            />
            <FieldError
              text={errors.message || ""}
              className={styles.messageError}
            />
          </Form.Field>
          <Form.Field id="addLabel" className={styles.label}>
            <AddLabelDropdown
              setSelectedLabels={(labels: HashTagType[]) =>
                setFieldValue("labels", labels)
              }
              selectedLabels={values.labels}
              error={errors.labels}
            />
            <span className={styles.labelHint}>
              {t("chat.facebookOTN.modal.sendRequest.form.addLabel.hint")}
            </span>
          </Form.Field>
          <Button
            customSize="mid"
            primary
            className={styles.button}
            onClick={submitForm}
            content={t("chat.facebookOTN.modal.sendRequest.form.send")}
            loading={loading}
          />
        </Form>
        <FieldError
          text={errors.inActivated || ""}
          className={styles.InActivatedError}
        />
      </div>
      <SendRequestPreview pageId={pageId} message={values.message} />
    </div>
  );
};
export default SendRequestContent;
