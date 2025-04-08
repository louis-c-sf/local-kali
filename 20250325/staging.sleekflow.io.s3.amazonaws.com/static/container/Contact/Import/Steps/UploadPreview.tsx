import React, { useEffect } from "react";
import {
  ColumnMapping,
  DispatchingStep,
  MapField,
  SharesFileRef,
  UploadPreviewState,
} from "../contracts";
import { isApiSimpleError } from "../../../../api/apiRequest";
import { DummyTable, PreviewTable } from "./UploadPreview/PreviewTable";
import { useCustomProfileFields } from "../../hooks/useCustomProfileFields";
import { ImportActionType } from "../../../../types/Contact/Import/PreviewType";
import produce from "immer";
import { Trans, useTranslation } from "react-i18next";
import { sendPreviewFile } from "api/Contacts/Import/sendPreviewFile";
import { ErrorModal } from "container/Contact/Import/Steps/UploadPreview/ErrorModal";
import { ConfirmModal } from "container/Contact/Import/Steps/UploadPreview/ConfirmModal";

const STATIC_MAP_FIELDS: MapField[] = [
  {
    displayName: "Contact ID",
    fieldName: "ContactId",
  },
  {
    displayName: "First Name",
    fieldName: "FirstName",
  },
  {
    displayName: "Last Name",
    fieldName: "LastName",
  },
  {
    displayName: "Label",
    fieldName: "Label",
  },
];
const EXCLUDE_FIELDS: string[] = ["LastContact", "LastContactFromCustomers"];
export const READONLY_FIELDS = ["ContactId", "Email", "PhoneNumber"] as const;

interface UploadResultsProps extends DispatchingStep, SharesFileRef {
  stepState: UploadPreviewState;
  errors: string[];
}

function UploadPreview(props: UploadResultsProps) {
  const {
    nextClicked,
    nextConfirmed,
    resultsOk,
    response,
    columnsMapping,
    columnsMappingInitial,
    previewRefreshing,
  } = props.stepState;
  const { errors, importDispatch, file } = props;

  const { t } = useTranslation();

  const { fields: customFields } = useCustomProfileFields({
    excludeLabels: true,
  });
  const mapFields = [
    ...STATIC_MAP_FIELDS,
    ...customFields.filter((fld) => !EXCLUDE_FIELDS.includes(fld.fieldName)),
  ];

  useEffect(() => {
    if (!file || !previewRefreshing) {
      return;
    }
    previewFile(file, mapFields, columnsMapping);
  }, [file, previewRefreshing]);

  async function previewFile(
    file: File,
    mapFields: MapField[],
    mapping?: ColumnMapping[]
  ) {
    importDispatch({ type: "PREVIEW_REQUESTED" });
    const actionMap: Record<number, ImportActionType> = {
      0: "Overwrite",
      1: "UpdateBlankOnly",
      2: "Append",
    };

    try {
      const response = await sendPreviewFile(file, mapping);
      const responseNormalized = produce(response, (draft) => {
        draft.headers.forEach((header) => {
          header.headerName = header.headerName ?? null;
          header.importAction = actionMap[header.importAction] ?? "Append";
        });
      });
      if (
        responseNormalized.records === undefined ||
        responseNormalized.records.length === 0
      ) {
        throw "No records";
      }

      importDispatch({
        type: "PREVIEW_COMPLETED",
        response: responseNormalized,
        mapFields,
      });
    } catch (error) {
      console.error("previewFile", error);
      let errorText = String(error);
      if (isApiSimpleError(error)) {
        errorText = String(error.message);
        try {
          const { message } = JSON.parse(errorText);
          if (message) {
            errorText = message;
          }
        } catch (e) {}
      }
      importDispatch({ type: "PREVIEW_ERROR", error: errorText });
    }
  }

  const showError = errors.length > 0;
  return (
    <>
      <div className="preview-content">
        <h4 className="ui header">
          {t("profile.list.import.step.preview.header")}
        </h4>
        <Trans i18nKey={"profile.list.import.step.preview.text"}>
          <p>
            Each column header below should be matched with a column on
            SleekFlow.
            <br />
            If column does not exist on SleekFlow, please create a new column in
            the "Contacts" tab.
          </p>
        </Trans>
        <div className={"splash splash__preview-content"}>
          {response && columnsMappingInitial ? (
            <PreviewTable
              response={response}
              columnsMapping={columnsMapping}
              initialColumnsMapping={columnsMappingInitial}
              mapFields={mapFields}
              setColumnMapping={async (columnNumber, fieldId) => {
                importDispatch({
                  type: "PREVIEW_COLUMN_MAPPED",
                  columnNumber: columnNumber,
                  fieldName: fieldId,
                });
              }}
              setColumnAction={(columnNumber, action) => {
                importDispatch({
                  type: "PREVIEW_COLUMN_ACTION_UPDATED",
                  columnNumber,
                  action,
                });
              }}
            />
          ) : (
            <DummyTable />
          )}
        </div>
      </div>
      {nextClicked && !resultsOk && !nextConfirmed && (
        <ConfirmModal
          file={file}
          confirm={() =>
            props.importDispatch({ type: "INVALID_UPLOAD_CONFIRM" })
          }
          cancel={() => props.importDispatch({ type: "INVALID_UPLOAD_CANCEL" })}
        />
      )}

      {showError && (
        <ErrorModal
          error={props.errors[0]}
          onClose={() =>
            props.importDispatch({ type: "INVALID_UPLOAD_CANCEL" })
          }
        />
      )}
    </>
  );
}

export default UploadPreview;
