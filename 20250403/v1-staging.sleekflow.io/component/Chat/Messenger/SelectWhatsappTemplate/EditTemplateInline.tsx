import React, { useCallback, useEffect, useState } from "react";
import styles from "./EditTemplateInline.module.css";
import { useAppDispatch, useAppSelector } from "../../../../AppRootContext";
import { walkWhatsappTemplateParts } from "./walkWhatsappTemplateParts";
import { VarInput } from "./VarInput";
import { assoc } from "ramda";
import {
  SendMediaUploadable,
  SendMediaUploadProxyType,
} from "../../../../types/AutomationActionType";
import { UploadDocument } from "../../../shared/upload/UploadDocument";
import {
  isURLButton,
  TemplateVariableState,
  UPDATED_PART_ENUM,
} from "../../../../App/reducers/Chat/whatsappTemplatesReducer";
import { Whatsapp360DialogTemplateMessageComponentImageParameterType } from "../../../../types/MessageType";
import { useTranslation } from "react-i18next";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { fileFormatMappingTranslation } from "../../../AssignmentRules/AutomationRuleEdit/actions/SendWhatsApp360DialogMessage/SendMessageHeaderFile";
import { OptInContentType } from "features/Whatsapp360/models/OptInType";
import { useWhatsapp360Upload } from "features/Whatsapp360/usecases/Inbox/useWhatsapp360Upload";
import { WhatsappChannelType } from "component/Chat/Messenger/types";
import { useWhatsappCloudApiUpload } from "features/WhatsappCloudAPI/usecases/Inbox/useWhatsappCloudApiUpload";
import extractWhatsAppFragment from "container/Settings/OfficialWhatsApp/extractWhatsAppFragment";
import { getHeaderFileFormatLimit, MEGABYTE } from "config/MessageConversion";
import { isDynamicUrlButtonExist } from "component/Broadcast/shared/BroadcastTemplateDisplay/DynamicURLButton";

export function getInputId(varName: string) {
  return `inbox_template_var_${varName}`;
}

export function isVarFilled(value: string | undefined) {
  return (value ?? "").trim() !== "";
}

export function getIsVarsSetValid(
  updatedPart: string,
  name: string,
  varValues: Record<string, string>,
  varsTouched: {}
) {
  return !varsTouched[`${updatedPart}_${name}`] || isVarFilled(varValues[name]);
}

export interface EditTemplateFileType extends SendMediaUploadable {
  filedId?: string;
}

export type FileUploadedTypeEnum = "image" | "document" | "video";

export function EditTemplateInline(props: {
  onSubmit: () => void;
  whatsappTemplate: OptInContentType;
  variables: TemplateVariableState;
  channel: WhatsappChannelType;
}) {
  const [varsTouched, setVarsTouched] = useState({});
  const [varFocusedName, setVarFocusedName] = useState<string>();
  const [errorMsg, setErrorMsg] = useState({});
  const loginDispatch = useAppDispatch();
  const [file, setFile] = useState<EditTemplateFileType>();

  const whatsapp360Upload = useWhatsapp360Upload();

  const cloudApiUpload = useWhatsappCloudApiUpload();

  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const hasError = useAppSelector(
    (s) => s.inbox.messenger.sendWhatsappTemplate.hasError
  );
  useEffect(() => {
    const headerNames = Object.keys(props.variables.header);
    const contentNames = Object.keys(props.variables.content);
    let focusElemId = "";
    let touched = {};
    if (headerNames.length > 0) {
      focusElemId = `header_${Object.keys(props.variables.header)[0]}`;
      touched = {
        ...headerNames.reduce(
          (prev, next) => ({ ...prev, [`header_${next}`]: false }),
          {}
        ),
        ...contentNames.reduce(
          (prev, next) => ({ ...prev, [`content_${next}`]: false }),
          {}
        ),
      };
    } else if (contentNames.length > 0) {
      focusElemId = `content_${Object.keys(props.variables.content)[0]}`;
      touched = {
        ...contentNames.reduce(
          (prev, next) => ({ ...prev, [`content_${next}`]: false }),
          {}
        ),
      };
    }
    if (focusElemId) {
      document.getElementById(getInputId(focusElemId))?.focus();
    }
    if (Object.keys(touched).length > 0) {
      setVarsTouched({ ...touched });
    }
  }, [
    Object.keys(props.variables.content).join(),
    Object.keys(props.variables.header).join(),
  ]);

  const touchVar = useCallback(
    (name: string) => {
      setVarsTouched(assoc(name, true));
    },
    [setVarsTouched, setVarFocusedName]
  );

  const loseFocus = useCallback(() => {
    setVarFocusedName(undefined);
  }, [setVarFocusedName]);

  const catchFocus = useCallback(
    (name: string) => {
      setVarFocusedName(name);
      loginDispatch({
        type: "INBOX.WHATSAPP_TEMPLATE.VAR_FOCUS",
        name,
      });
    },
    [setVarFocusedName]
  );

  const updateVarChanged = useCallback(
    (updatedPart: UPDATED_PART_ENUM, name: string, value: string) => {
      const updatedName = name.includes(updatedPart)
        ? name
        : `${updatedPart}_${name}`;
      loginDispatch({
        type: "INBOX.WHATSAPP_TEMPLATE.VAR_UPDATED",
        updatedPart,
        name: name.replace(`${updatedPart}_`, ""),
        value,
      });
      if ([...value.matchAll(/\s{4,}/g)].length > 0) {
        setErrorMsg((msg) => ({
          ...msg,
          [updatedName]: t("tooltip.template.extraSpace"),
        }));
      } else {
        setErrorMsg((msg) => ({
          ...msg,
          [updatedName]: "",
        }));
      }
      touchVar(updatedName);
    },
    [loginDispatch, touchVar]
  );

  useEffect(() => {
    const nonEmptyVal = Object.values(errorMsg).filter((val) => val !== "");
    if (nonEmptyVal.length > 0) {
      loginDispatch({
        type: "INBOX.WHATSAPP_TEMPLATE.HAS_ERROR",
        hasError: true,
      });
    } else if (hasError) {
      loginDispatch({
        type: "INBOX.WHATSAPP_TEMPLATE.HAS_ERROR",
        hasError: false,
      });
    }
  }, [errorMsg, hasError]);

  async function deleteFile(file: EditTemplateFileType) {
    if (!file?.filedId) {
      return;
    }
    try {
      if (props.channel === "whatsapp360dialog") {
        await whatsapp360Upload.deleteFile(file.filedId);
      } else if (props.channel === "whatsappcloudapi") {
        await cloudApiUpload.deleteFile(file.filedId);
      } else {
        throw "Unsupported channel";
      }

      loginDispatch({
        type: "INBOX.WHATSAPP_TEMPLATE.FILE_REMOVED",
      });

      setFile(undefined);
    } catch (e) {
      console.error(e);
    }
  }

  async function submitFile(files: SendMediaUploadProxyType[]) {
    const template = props.whatsappTemplate;
    if (!template?.header || files.length === 0) {
      return;
    }
    try {
      const [file] = files;
      const format =
        template.header.format.toLowerCase() as FileUploadedTypeEnum;

      let result: { url: string; filename: string; id: string } | undefined =
        undefined;
      const fileSizeLimit = getHeaderFileFormatLimit(
        props.channel,
        format.toUpperCase()
      ).sizeLimit;

      if (fileSizeLimit * MEGABYTE < file.file.size) {
        flash(
          t("flash.inbox.error.attach.fileMax", { size: `${fileSizeLimit}MB` })
        );
        return;
      }

      if (props.channel === "whatsapp360dialog") {
        result = await whatsapp360Upload.upload(file, format);
      } else if (props.channel === "whatsappcloudapi") {
        result = await cloudApiUpload.upload(file, format);
      } else {
        throw `Unsupported channel: ${props.channel}`;
      }

      if (!result) {
        return;
      }

      if (file) {
        setFile({
          ...file,
          filedId: result.id,
        });
      }

      if (format === "image") {
        const image: Whatsapp360DialogTemplateMessageComponentImageParameterType =
          {
            type: format,
            image: {
              link: result.url,
            },
          };
        if (props.channel === "whatsapp360dialog") {
          image.image.filename = result.filename;
        }
        loginDispatch({
          type: "INBOX.WHATSAPP_TEMPLATE.FILE_UPLOADED",
          file: {
            ...image,
          },
        });
      } else if (format === "video") {
        loginDispatch({
          type: "INBOX.WHATSAPP_TEMPLATE.FILE_UPLOADED",
          file: {
            type: format,
            video: {
              link: result.url,
            },
          },
        });
      } else {
        loginDispatch({
          type: "INBOX.WHATSAPP_TEMPLATE.FILE_UPLOADED",
          file: {
            type: format,
            document: {
              link: result.url,
              filename: result.filename,
            },
          },
        });
      }
    } catch (e) {
      console.error("submitFile", e);
    }
  }

  const isHeaderText = props.whatsappTemplate.header?.format === "TEXT";
  const urlButton = props.whatsappTemplate.buttons?.find(isURLButton);

  const { content: fragments, header: headerFragments } =
    extractWhatsAppFragment(props.whatsappTemplate);
  return (
    <div className={isHeaderText ? styles.editor : styles.editorWithFile}>
      <div className={styles.content}>
        <div className={styles.headerText}>
          {headerFragments.map((f) => {
            if (f.type === "string") {
              return f.value;
            }
            const name = `header_${f.name}`;
            return (
              <VarInput
                onSubmit={props.onSubmit}
                key={f.name}
                name={name}
                updatedPart={"header"}
                value={props.variables.header[f.name] ?? ""}
                id={getInputId(name)}
                errorMessage={errorMsg[name]}
                valid={
                  varFocusedName === f.name
                    ? true
                    : getIsVarsSetValid(
                        "header",
                        f.name,
                        props.variables.header,
                        varsTouched
                      )
                }
                onChange={updateVarChanged}
                onFocus={catchFocus}
                onBlur={loseFocus}
              />
            );
          })}
        </div>
        <div className={styles.body}>
          {fragments.map((f) => {
            if (f.type === "string") {
              return f.value;
            }
            const name = `content_${f.name}`;
            return (
              <VarInput
                onSubmit={props.onSubmit}
                key={f.name}
                name={name}
                updatedPart={"content"}
                value={props.variables.content[f.name] ?? ""}
                id={getInputId(name)}
                valid={
                  varFocusedName === f.name
                    ? true
                    : getIsVarsSetValid(
                        "content",
                        f.name,
                        props.variables.content,
                        varsTouched
                      )
                }
                errorMessage={errorMsg[name]}
                onChange={updateVarChanged}
                onFocus={catchFocus}
                onBlur={loseFocus}
              />
            );
          })}
        </div>
        {props.whatsappTemplate.footer && (
          <div className={styles.footer}>
            {props.whatsappTemplate.footer.text}
          </div>
        )}
        {props.channel === "whatsappcloudapi" &&
          Object.keys(props.variables.button).length > 0 && (
            <DynamicUrlLinkContainer
              varsTouched={varsTouched}
              onSubmit={props.onSubmit}
              buttonContent={urlButton?.url}
              button={props.variables.button}
              varFocusedName={varFocusedName}
              errorMsg={errorMsg}
              updateVarChanged={updateVarChanged}
              catchFocus={catchFocus}
              loseFocus={loseFocus}
            />
          )}
      </div>
      {props.whatsappTemplate.header && !isHeaderText && (
        <div className={styles.header}>
          <UploadDocument
            setFiles={(updatedFiles) => submitFile(updatedFiles)}
            files={file ? [file] : []}
            deleteFile={(tmpFile) =>
              deleteFile(tmpFile as EditTemplateFileType)
            }
            labelElem={<></>}
            className={props.whatsappTemplate.header?.format}
            mimeTypes={
              getHeaderFileFormatLimit(
                props.channel,
                props.whatsappTemplate.header.format.toUpperCase()
              ).mimeType
            }
            uploadType={
              fileFormatMappingTranslation(
                t,
                props.whatsappTemplate.header.format
              ).header
            }
            isDisplayShortDesc={true}
          />
        </div>
      )}
    </div>
  );
}
function DynamicUrlLinkContainer({
  onSubmit,
  button,
  varFocusedName,
  varsTouched,
  updateVarChanged,
  catchFocus,
  loseFocus,
  errorMsg,
  buttonContent,
}: {
  onSubmit: () => void;
  button: Record<string, string>;

  varsTouched: {};
  updateVarChanged: (
    updatedPart: UPDATED_PART_ENUM,
    name: string,
    value: string
  ) => void;
  catchFocus: (name: string) => void;
  loseFocus: () => void;
  errorMsg: Record<string, string>;
  buttonContent?: string;
  varFocusedName?: string;
}) {
  const { t } = useTranslation();
  const fragments = buttonContent
    ? walkWhatsappTemplateParts(buttonContent)
    : [];
  return (
    <div className={styles.urlBlock}>
      <div className={styles.title}>{t("chat.dynamicURL.title")}</div>
      <div className={styles.inputBlock}>
        {fragments.map((f) => {
          if (f.type === "string") {
            return f.value;
          }
          const name = `button_${f.name}`;
          return (
            <VarInput
              onSubmit={onSubmit}
              key={f.name}
              name={name}
              updatedPart={"button"}
              value={button[f.name] ?? ""}
              id={getInputId(name)}
              valid={
                varFocusedName === f.name
                  ? true
                  : getIsVarsSetValid("button", f.name, button, varsTouched)
              }
              errorMessage={errorMsg[name]}
              onChange={updateVarChanged}
              onFocus={catchFocus}
              onBlur={loseFocus}
            />
          );
        })}
      </div>
    </div>
  );
}
