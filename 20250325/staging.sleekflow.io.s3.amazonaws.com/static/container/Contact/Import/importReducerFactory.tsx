import React from "react";
import {
  ColumnMapping,
  ColumnMappingStatic,
  ImportAction,
  ImportState,
} from "./contracts";
import { nextStep, prevStep, updateStep } from "./mutators";
import { detailsFormValid, previewMappingValidate } from "./stepsFlow";
import produce from "immer";
import { TFunction } from "i18next";

const importReducerFactory =
  (t: TFunction) =>
  (state: ImportState, action: ImportAction): ImportState => {
    switch (action.type) {
      case "CANCEL": {
        return { ...state, cancelRequested: true };
      }

      case "UNDO_CANCEL": {
        return { ...state, cancelRequested: false };
      }

      case "CONFIRM_CANCEL": {
        return { ...state, cancelConfirmed: true };
      }

      case "RESET_WIZARD": {
        return defaultState();
      }

      case "PREV_STEP": {
        return prevStep(state);
      }

      case "NEXT_STEP": {
        return nextStep(state);
      }

      case "SAMPLE_DOWNLOAD_REQUESTED": {
        return updateStep({ ...state, loading: true }, "downloadFileSample", {
          downloadRequested: true,
          downloadFileMime: action.downloadFileMime,
        });
      }

      case "SAMPLE_DOWNLOAD_STARTED": {
        return updateStep({ ...state, loading: true }, "downloadFileSample", {
          downloadRequested: false,
          downloadCompleted: false,
          downloadInProgress: true,
        });
      }

      case "SAMPLE_DOWNLOAD_COMPLETED": {
        return updateStep({ ...state, loading: false }, "downloadFileSample", {
          downloadCompleted: true,
          downloadInProgress: false,
        });
      }

      case "INVALID_UPLOAD_CONFIRM": {
        return updateStep(nextStep(state), "uploadPreview", {
          nextConfirmed: true,
        });
      }

      case "INVALID_UPLOAD_CANCEL": {
        return updateStep(
          {
            ...state,
            stepNumber: state.stepNumber - 1,
            allowNext: true,
            errors: [],
          },
          "uploadPreview",
          defaultState().steps.uploadPreview
        );
      }

      case "UPLOAD_FILE_CHOSEN": {
        return updateStep(
          { ...state, file: action.file, allowNext: false, errors: [] },
          "uploadContactsFile",
          {
            uploadFileChosen: true,
            uploadedFileName: action.file.name,
          }
        );
      }
      case "UPLOAD_FILE_RESET": {
        return updateStep(
          { ...state, file: undefined, allowNext: false },
          "uploadContactsFile",
          {
            uploadFileChosen: false,
            uploadedFileName: "",
          }
        );
      }

      case "MORE_CONTACTS_VALIDATION_SUCCEEDED": {
        return { ...state, allowNext: true };
      }

      case "PREVIEW_REQUESTED": {
        return updateStep(
          { ...state, loading: true, errors: [] },
          "uploadPreview",
          {}
        );
      }

      case "PREVIEW_COMPLETED": {
        const columns = action.response.headers.map<ColumnMapping>(
          (header, idx) => ({
            csvFileColumnNumber: idx,
            name: header.headerName,
            importAction: header.importAction,
          })
        );
        const columnsMappingInitial =
          state.steps.uploadPreview.columnsMappingInitial ??
          ([...columns] as ColumnMappingStatic[]);

        const columnsMapping = columns.map((column) => {
          const foundField = action.mapFields.find(
            (field) => field.fieldName === column.name
          );
          return {
            ...column,
            name: foundField ? column.name : null,
          };
        });

        const mappingError = previewMappingValidate(columnsMapping, t);

        return updateStep(
          {
            ...state,
            loading: false,
            importName: action.response.importName,
            allowNext: mappingError === undefined,
            nextBlockingError: mappingError,
          },
          "uploadPreview",
          {
            response: action.response,
            resultsOk:
              action.response.headers.filter((h) => !h.isValid).length === 0,
            columnsMapping,
            columnsMappingInitial,
            previewRefreshing: false,
          }
        );
      }

      case "PREVIEW_ERROR": {
        return {
          ...state,
          loading: false,
          errors: [action.error],
        };
      }

      case "PREVIEW_COLUMN_MAPPED": {
        return produce(state, (draft) => {
          const currentMap =
            draft.steps.uploadPreview.columnsMapping[action.columnNumber];
          if (!currentMap) {
            console.warn(
              `Trying to update missing column ${action.columnNumber}`
            );
            return;
          }

          if (action.fieldName === null) {
            currentMap.name = null;
            draft.nextBlockingError = previewMappingValidate(
              draft.steps.uploadPreview.columnsMapping,
              t
            );
            return;
          }

          const anotherValueIndices =
            state.steps.uploadPreview.columnsMapping.reduce<number[]>(
              (acc, next, idx) => {
                if (next.name === action.fieldName) {
                  return [...acc, idx];
                }
                return acc;
              },
              []
            );

          for (const i of anotherValueIndices) {
            draft.steps.uploadPreview.columnsMapping[i].name = null;
          }
          currentMap.name = action.fieldName;
          draft.nextBlockingError = previewMappingValidate(
            draft.steps.uploadPreview.columnsMapping,
            t
          );

          draft.steps.uploadPreview.previewRefreshing = true;
          draft.loading = true;
        });
      }

      case "PREVIEW_COLUMN_ACTION_UPDATED":
        return produce(state, (draft) => {
          const currentMap =
            draft.steps.uploadPreview.columnsMapping[action.columnNumber];
          if (!currentMap) {
            console.warn(
              `Trying to update missing column ${action.columnNumber}`
            );
            return;
          }
          currentMap.importAction = action.action;
        });

      case "AGREE_WITH_CONDITIONS": {
        let newState = updateStep({ ...state }, "uploadDetailsForm", {
          agreeWithConditions: action.value,
        });

        return { ...newState, allowNext: detailsFormValid(newState) };
      }

      case "IMPORT_NAME_UPDATE": {
        let newState = {
          ...state,
          importName: action.name,
          importListId: undefined,
        };
        return {
          ...newState,
          allowNext: detailsFormValid(newState),
        };
      }

      case "IMPORT_LIST_SELECT": {
        let newState = {
          ...state,
          importName: action.name,
          importListId: action.id,
        };
        return {
          ...newState,
          allowNext: detailsFormValid(newState),
        };
      }

      case "FILE_PARSING_ENQUEUED": {
        return updateStep(
          { ...state, saveConfirmed: false },
          "uploadDetailsForm",
          {
            parsingEnqueued: true,
          }
        );
      }

      case "FILE_PARSING_COMPLETED": {
        return updateStep({ ...state }, "uploadDetailsForm", {
          parsingInProgress: false,
          parsingCompleted: true,
        });
      }

      case "ERROR":
        return {
          ...state,
          loading: false,
          errors: [action.error],
        };

      case "UPDATE_IS_TRIGGER_AUTOMATION":
        let newState = updateStep(state, "uploadDetailsForm", {
          isTriggerAutomation: action.value,
        });

        return { ...newState };
    }

    return state;
  };

export const defaultState = (): ImportState => {
  return {
    errors: [],
    loading: false,
    cancelRequested: false,
    cancelConfirmed: false,
    stepNumber: 1,
    stepsTotal: 5,
    allowPrev: true,
    allowNext: true,
    file: undefined,
    saveConfirmed: false,
    importName: undefined,
    importListId: undefined,
    nextBlockingError: undefined,
    steps: {
      downloadFileSample: {
        downloadCompleted: false,
        downloadRequested: false,
        downloadInProgress: false,
        downloadFileMime: "",
      },
      uploadContactsFile: { uploadFileChosen: false, uploadStarted: false },
      uploadPreview: {
        nextClicked: false,
        nextConfirmed: false,
        resultsOk: false,
        columnsMapping: [],
        columnsMappingInitial: null,
        previewRefreshing: false,
      },
      uploadDetailsForm: {
        agreeWithConditions: false,
        parsingCompleted: false,
        parsingInProgress: false,
        parsingEnqueued: false,
        isTriggerAutomation: true,
      },
    },
  };
};

export default importReducerFactory;
