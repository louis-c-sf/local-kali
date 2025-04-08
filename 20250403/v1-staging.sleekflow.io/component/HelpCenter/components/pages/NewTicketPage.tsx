import React, { useContext, useEffect, useState } from "react";
import { Button, Dropdown, DropdownProps, Form } from "semantic-ui-react";
import Textarea from "react-textarea-autosize";
import { useTranslation } from "react-i18next";
import { POST_NEW_ISSUE_TICKET } from "../../../../api/apiPath";
import { postFiles } from "../../../../api/apiRequest";
import { mergeLeft, remove } from "ramda";
import { object, string } from "yup";
import { HelpCenterContext } from "../../hooks/helpCenterContext";
import { HelpCenterFormType, StepsEnum } from "../../hooks/HelpCenterStateType";
import WidgetHeader from "../WidgetHeader";
import { WrapField } from "../../../shared/form/WrapField";
import { UploadDocument } from "../../../shared/upload/UploadDocument";
import styles from "./NewTicketPage.module.css";
import { useAppSelector } from "../../../../AppRootContext";

type selectedValue = {
  key?: number;
  value: string;
  text: string;
};

interface FieldValue {
  [key: string]: string;
}

const getOptionsVal = (options: selectedValue[]) => {
  return options.map((option, i) => ({
    key: i + 1,
    value: option.value,
    text: option.text,
  }));
};
const getSelectedVal = (optionsVal: selectedValue[], selectedVal: string) => {
  return optionsVal.find((optionVal) => optionVal.value === selectedVal);
};

export const NewTicketPage = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useContext(HelpCenterContext);
  const userEmail = useAppSelector((s) => s.loggedInUserDetail?.userInfo.email);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldValues, setFieldValues] = useState<HelpCenterFormType>({
    email: state.form.email,
    subject: state.form.subject,
    issueType: state.form.issueType,
    issueLevel: state.form.issueLevel,
    detail: state.form.detail,
    files: state.form.files,
  });

  useEffect(() => {
    if (userEmail) {
      setFieldValues((fieldValues) => ({
        ...fieldValues,
        email: userEmail,
      }));
    }
  }, [userEmail]);
  const [fieldErrors, setFieldErrors] = useState<FieldValue>({});
  const maxSize = 20;
  const uploadFileMB = maxSize * Math.pow(1024, 2);
  const fieldData = {
    email: {
      name: "email",
      label: t("nav.helpCenter.newTicketPage.form.email.label"),
      errMsg: t("nav.helpCenter.newTicketPage.form.email.errMsg"),
      required: t("nav.helpCenter.newTicketPage.form.email.required"),
      placeholder: t("nav.helpCenter.newTicketPage.form.email.placeholder"),
    },
    subject: {
      name: "subject",
      label: t("nav.helpCenter.newTicketPage.form.subject.label"),
      errMsg: t("nav.helpCenter.newTicketPage.form.subject.errMsg"),
      placeholder: t("nav.helpCenter.newTicketPage.form.subject.placeholder"),
      max: 200,
    },
    issueType: {
      name: "issueType",
      label: t("nav.helpCenter.newTicketPage.form.issueType.label"),
      errMsg: t("nav.helpCenter.newTicketPage.form.issueType.errMsg"),
      placeholder: t("nav.helpCenter.newTicketPage.form.issueType.placeholder"),
      options: [
        {
          value: "Inbox",
          text: t("nav.helpCenter.newTicketPage.form.issueType.options.inbox"),
        },
        {
          value: "Contacts",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.contacts"
          ),
        },
        {
          value: "Campaign",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.campaigns"
          ),
        },
        {
          value: "Automations",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.automations"
          ),
        },
        {
          value: "Analytics",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.analytics"
          ),
        },
        {
          value: "Live Chat Widget",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.liveChat"
          ),
        },
        {
          value: "Channels & Connections",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.channelsConnections"
          ),
        },
        {
          value: "App Integrations",
          text: t("nav.helpCenter.newTicketPage.form.issueType.options.app"),
        },
        {
          value: "Official WhatsApp Application",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.whatsApp"
          ),
        },
        {
          value: "General Settings",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.settings"
          ),
        },
        {
          value: "Subscriptions & Billing",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueType.options.subscriptionBilling"
          ),
        },
        {
          value: "Others",
          text: t("nav.helpCenter.newTicketPage.form.issueType.options.others"),
        },
      ],
    },
    issueLevel: {
      name: "issueLevel",
      label: t("nav.helpCenter.newTicketPage.form.issueLevel.label"),
      errMsg: t("nav.helpCenter.newTicketPage.form.issueLevel.errMsg"),
      placeholder: t(
        "nav.helpCenter.newTicketPage.form.issueLevel.placeholder"
      ),
      options: [
        {
          value: "Low",
          text: t("nav.helpCenter.newTicketPage.form.issueLevel.options.low"),
        },
        {
          value: "Medium",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueLevel.options.medium"
          ),
        },
        {
          value: "Critical",
          text: t(
            "nav.helpCenter.newTicketPage.form.issueLevel.options.critical"
          ),
        },
      ],
    },
    detail: {
      name: "detail",
      label: t("nav.helpCenter.newTicketPage.form.detail.label"),
      errMsg: t("nav.helpCenter.newTicketPage.form.detail.errMsg"),
      placeholder: t("nav.helpCenter.newTicketPage.form.detail.placeholder"),
      max: 1000,
    },
    upload: {
      name: "upload",
      label: t("nav.helpCenter.newTicketPage.form.upload.title"),
      description: t("nav.helpCenter.newTicketPage.form.upload.description", {
        max: maxSize,
      }),
      errMsg: t("nav.helpCenter.newTicketPage.form.upload.errMsg", {
        max: maxSize,
      }),
    },
  };
  const textFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { value, id } = e.target;
    setFieldValues((fields: HelpCenterFormType) => ({
      ...fields,
      [fieldName]: value,
    }));
  };
  const selectOption = (
    e: React.SyntheticEvent,
    data: DropdownProps,
    labelName: string
  ) => {
    const { value } = data;
    setFieldValues((fields: HelpCenterFormType) => ({
      ...fields,
      [labelName]: value as string,
    }));
  };
  const textAreaFieldChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    fieldName: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const { value } = e.target;
    setFieldValues({
      ...fieldValues,
      [fieldName]: value,
    });
  };

  const formValidator = object().shape({
    email: string()
      .trim()
      .ensure()
      .required(fieldData.email.required)
      .email(fieldData.email.errMsg),
    subject: string().trim().ensure().required(fieldData.subject.errMsg),
    issueType: string().trim().ensure().required(fieldData.issueType.errMsg),
    issueLevel: string().trim().ensure().required(fieldData.issueLevel.errMsg),
    detail: string().trim().ensure().required(fieldData.detail.errMsg),
  });

  const formSubmit = async () => {
    setIsLoading(true);
    setFieldErrors({});
    const { email, subject, issueType, issueLevel, detail, files } =
      fieldValues;
    try {
      await formValidator.validate({
        email: email,
        subject: subject,
        issueType: issueType,
        issueLevel: issueLevel,
        detail: detail,
      });
    } catch (e) {
      setIsLoading(false);
      setFieldErrors({ [e.path]: e.message });
      return;
    }

    try {
      if (files.length > 0) {
        const totalSize = files.reduce((prev, f) => prev + f.file.size, 0);
        if (totalSize > uploadFileMB) {
          setFieldErrors({ upload: fieldData.upload.errMsg });
          return;
        }
      }
      const filesParam = files.map((f) => ({
        name: "Files",
        file: f.file,
      }));
      const result = await postFiles(POST_NEW_ISSUE_TICKET, filesParam, {
        param: {
          Email: email,
          Subject: subject,
          IssueType: issueType,
          IssueLevel: issueLevel,
          Details: detail,
        },
      });
      if (result.hubSpotTicketId) {
        dispatch({
          type: "UPDATE_TICKET_NO",
          ticketNo: result.hubSpotTicketId,
        });
        dispatch({ type: "UPDATE_STEP", step: StepsEnum.Submission });
      }
    } catch (e) {
      console.log("e: ", e);
    } finally {
      setIsLoading(false);
      dispatch({ type: "RESET_FORM" });
    }
  };

  return (
    <div
      className={`
      ${
        state.step === StepsEnum.Main
          ? styles.animationContainerMain
          : styles.animationContainerNew
      }
      ${styles.animationContainer}
    `}
    >
      <WidgetHeader values={fieldValues}>
        <div className={styles.children}>
          <span>{t("nav.helpCenter.header.newTicket.title")}</span>
          <span>{t("nav.helpCenter.header.newTicket.subTitle")}</span>
        </div>
      </WidgetHeader>
      <Form as="div" className={styles.form}>
        {[fieldData.email.name, fieldData.subject.name].map(
          (fieldName, index) => {
            const hasMax = !!fieldData[fieldName].max ?? false;
            return (
              <WrapField
                key={fieldName}
                id={fieldName}
                label={fieldData[fieldName].label}
                error={fieldErrors[fieldName]}
                required={true}
                {...(hasMax
                  ? {
                      limit: {
                        max: fieldData[fieldName].max,
                        currentTextLength: fieldValues[fieldName]?.length ?? 0,
                      },
                    }
                  : {})}
              >
                <Form.Input
                  fluid
                  value={fieldValues[fieldName]}
                  id={fieldName}
                  onChange={(e) => textFieldChange(e, fieldName)}
                  placeholder={fieldData[fieldName].placeholder}
                  {...(hasMax
                    ? {
                        maxLength: fieldData[fieldName].max,
                      }
                    : {})}
                />
              </WrapField>
            );
          }
        )}
        {[fieldData.issueType.name, fieldData.issueLevel.name].map(
          (fieldName, index) => {
            const optionsVal = getOptionsVal(fieldData[fieldName].options);
            const selectedVal = getSelectedVal(
              optionsVal,
              fieldValues[fieldName]
            );
            return (
              <WrapField
                key={fieldName}
                id={fieldName}
                label={fieldData[fieldName].label}
                error={fieldErrors[fieldName]}
                required={true}
              >
                <Dropdown
                  scrolling
                  lazyLoad
                  upward={false}
                  search
                  fluid={false}
                  text={selectedVal?.text || ""}
                  noResultsMessage={t("form.field.dropdown.noResults")}
                  value={
                    fieldValues[fieldName] &&
                    optionsVal.some((v) => v.value === fieldValues[fieldName])
                      ? fieldValues[fieldName]
                      : ""
                  }
                  options={[
                    {
                      value: "",
                      text: fieldData[fieldName].placeholder,
                      className: "option-default",
                      key: 0,
                    },
                    ...optionsVal,
                  ]}
                  onChange={(e, data) =>
                    selectOption(e, data, fieldData[fieldName].name)
                  }
                  placeholder={fieldData[fieldName].placeholder}
                />
              </WrapField>
            );
          }
        )}
        <WrapField
          id={fieldData.detail.name}
          label={fieldData.detail.label}
          error={fieldErrors.detail}
          required={true}
          limit={{
            max: fieldData.detail.max,
            currentTextLength: fieldValues.detail?.length ?? 0,
          }}
        >
          <Textarea
            maxRows={2}
            minRows={1}
            id={fieldData.detail.name}
            value={fieldValues.detail || ""}
            onChange={(e) => textAreaFieldChange(e, "detail")}
            placeholder={fieldData.detail.placeholder}
          />
        </WrapField>
        <UploadDocument
          className={styles.upload}
          error={fieldErrors.upload}
          labelElem={
            <label className={styles.uploadTitle}>
              <div>{fieldData.upload.label}</div>
              <div>{fieldData.upload.description}</div>
            </label>
          }
          files={fieldValues.files}
          setFiles={(file) => {
            setFieldValues(
              mergeLeft({
                files: file,
              })
            );
          }}
          deleteFile={(file) => {
            setFieldValues(
              mergeLeft({
                files: remove(Number(file.id), 1, fieldValues.files),
              })
            );
          }}
          mimeTypes={"image/png,image/jpeg,image/webp,application/pdf,video/*"}
        />
        <Button
          type="submit"
          loading={isLoading}
          onClick={formSubmit}
          primary
          className={styles.submitButton}
        >
          {t("nav.helpCenter.newTicketPage.form.button.submit")}
        </Button>
      </Form>
    </div>
  );
};
