import React, { useEffect, useState } from "react";
import completedSplashImg from "../../../../assets/images/document-stack-outline.svg";
import { Icon, Loader, Message } from "semantic-ui-react";
import {
  DispatchingStep,
  ImportState,
  UploadContactsFileState,
} from "../contracts";
import { useDropzone } from "react-dropzone";
import { UploadDropzoneInput } from "../../../../component/Form/UploadDropzoneInput";
import { Trans, useTranslation } from "react-i18next";
import styles from "./UploadContactsFile.module.css";
import submitValidateImport from "api/Contacts/Import/submitValidateImport";
import StatusAlert from "component/shared/StatusAlert";
import { useAppSelector } from "AppRootContext";
import { isAdminRole } from "component/Settings/helpers/AccessRulesGuard";
import iconStyles from "../../../../component/shared/Icon/Icon.module.css";
import { Link } from "react-router-dom";
import { assoc } from "ramda";

interface UploadContactsFileProps extends DispatchingStep {
  stepState: UploadContactsFileState;
  importState: ImportState;
}

const ACCEPT_MIME_TYPE =
  ".csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const UploadContactsFile = (props: UploadContactsFileProps) => {
  const loggedInUserDetail = useAppSelector((s) => s.loggedInUserDetail);
  const { t } = useTranslation();
  const errors = props.importState.errors || [];
  const { uploadedFileName, uploadFileChosen } = props.stepState;
  const [moreContactsInfo, setMoreContactsInfo] = useState({
    validationSucceeded: true,
    number: 0,
    loading: false,
  });
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) {
        let message = t("form.error.file.import.invalid");
        props.importDispatch({
          type: "ERROR",
          error: message,
        });
        return;
      }
      props.importDispatch({
        type: "UPLOAD_FILE_CHOSEN",
        file: acceptedFiles[0],
      });
    },
    multiple: false,
    noClick: true,
    accept: ACCEPT_MIME_TYPE,
  });
  const validImport = async (file: File) => {
    try {
      setMoreContactsInfo(assoc("loading", true, moreContactsInfo));
      const result = await submitValidateImport({
        file,
      });
      const restContacts =
        result.maximumNumberOfContacts - result.currentNumberOfContacts;
      if (result.validationSucceeded) {
        setMoreContactsInfo({
          ...moreContactsInfo,
          validationSucceeded: true,
          number: 0,
        });
        props.importDispatch({ type: "MORE_CONTACTS_VALIDATION_SUCCEEDED" });
      } else {
        setMoreContactsInfo({
          validationSucceeded: false,
          number: restContacts > 0 ? restContacts : 0,
          loading: false,
        });
        props.importDispatch({ type: "UPLOAD_FILE_RESET" });
      }
    } catch (e) {
      console.error("validImport e: ", e);
      setMoreContactsInfo(assoc("loading", false, moreContactsInfo));
    }
  };

  useEffect(() => {
    if (props.importState.file) {
      validImport(props.importState.file);
    }
  }, [props.importState.file]);

  return (
    <>
      <h4 className="ui header">
        {t("profile.list.import.step.upload.header")}
      </h4>
      <p>{t("profile.list.import.step.upload.text")}</p>
      {uploadFileChosen ? (
        <CompletedContent
          name={uploadedFileName}
          dispatch={props.importDispatch}
          resetWarning={() =>
            setMoreContactsInfo(
              assoc("validationSucceeded", true, moreContactsInfo)
            )
          }
        />
      ) : (
        <UploadDropzoneInput
          mimeTypes={ACCEPT_MIME_TYPE}
          getInputProps={getInputProps}
          getRootProps={getRootProps}
          isDragActive={isDragActive}
          isEmpty={true}
        >
          <Trans i18nKey={"form.field.dropzone.hint.contacts"}>
            Drag and drop or
            <a
              onClick={(event) => {
                event.preventDefault();
                open();
              }}
              className={"upload-dropzone-input__action-link"}
            >
              choose a file
            </a>
            &nbsp;to upload your contacts in .csv files.
          </Trans>
        </UploadDropzoneInput>
      )}
      {moreContactsInfo.loading ? (
        <Loader active inline="centered" />
      ) : (
        !moreContactsInfo.validationSucceeded && (
          <StatusAlert
            type="warning"
            headerText={t("profile.list.import.step.upload.limit.title")}
            children={
              <div>
                <Trans
                  i18nKey={"profile.list.import.step.upload.limit.content"}
                  values={{ number: moreContactsInfo.number }}
                >
                  According to your current plan, you can only add
                  <b>{moreContactsInfo.number} more new contacts.</b> You can
                  review the file you wish to import, or purchase more contact
                  storage under “Settings”.
                </Trans>
                {loggedInUserDetail && isAdminRole(loggedInUserDetail) && (
                  <div className={styles.guide}>
                    <Link to={"/settings/plansubscription"}>
                      {t("profile.list.import.step.upload.limit.purchase")}
                      <span
                        className={`${iconStyles.icon} ${styles.arrowIcon}`}
                      />
                    </Link>
                  </div>
                )}
              </div>
            }
            className={styles.alert}
          />
        )
      )}
      <Message warning hidden={errors.length === 0} size={"small"}>
        {errors.join(" ")}
      </Message>

      <div className={styles.warnContainer}>
        <div className={styles.title}>
          {t("profile.list.import.step.upload.mapContactWarn")}
        </div>
        <div className={styles.content}>
          <Trans i18nKey="profile.list.import.step.upload.mapContactDescription">
            SleekFlow can associate with existing contacts using the
            <span>contact’s Email Addresses</span> or <span>Phone Numbers</span>
            . If you import an existing contact, any matching properties can be
            updated with the latest data from your import.
          </Trans>
        </div>
      </div>
    </>
  );
};

const CompletedContent = (props: {
  name: any;
  dispatch: any;
  resetWarning: () => void;
}) => {
  return (
    <div
      className={`
        upload-dropzone-input 
        upload-dropzone-input__wrap
        upload-dropzone-input__wrap_empty
        `}
    >
      <div
        className={`
        splash
        step-upload-complete
        upload-dropzone-input__body
        empty
       `}
      >
        <img
          src={completedSplashImg}
          alt=""
          className={"upload-dropzone-input__icon"}
        />
        <div className={"upload-dropzone-input__description"}>
          <Trans
            i18nKey={"profile.list.import.step.upload.file.uploaded"}
            values={{
              name: props.name,
            }}
          >
            File uploaded, named
            <span className={"filename"}>“{props.name}”</span>
          </Trans>
        </div>
        <Icon
          name={"close"}
          onClick={() => {
            props.dispatch({ type: "UPLOAD_FILE_RESET" });
            props.resetWarning();
          }}
        />
      </div>
    </div>
  );
};

export default UploadContactsFile;
