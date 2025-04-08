import { ColumnMapping, ImportState } from "./contracts";
import { updateStep } from "./mutators";
import { TFunction } from "i18next";

const passState = (state: ImportState) => state;

export function detailsFormValid(state: ImportState): boolean {
  const agreed = state.steps.uploadDetailsForm.agreeWithConditions;
  const name = state.importName ? state.importName.trim() : "";
  const listId = state.importListId;
  return Boolean((agreed as boolean) && (name !== "" || listId !== undefined));
}

export function previewMappingValidate(
  columnsMapping: ColumnMapping[],
  t: TFunction
): string | undefined {
  const anyRequiredPresents = ["contactid", "phonenumber", "email"].some(
    (field) => {
      return columnsMapping.some(({ name }) => name?.toLowerCase() === field);
    }
  );
  if (!anyRequiredPresents) {
    return t("profile.list.import.error.requiredFields");
  }
}

export default {
  downloadFileSample: {
    prev(state: ImportState) {
      return { ...state, cancelConfirmed: true, loading: true };
    },
    next: passState,
    enter(state: ImportState) {
      return {
        ...state,
        file: undefined,
        allowNext: true,
      };
    },
  },

  setUpImportFile: {
    prev: passState,
    next: passState,
    enter(state: ImportState) {
      return {
        ...state,
        file: undefined,
        allowNext: true,
      };
    },
  },

  uploadContactsFile: {
    next: passState,
    prev: passState,
    enter: (state: ImportState) => {
      return {
        ...state,
        allowNext: state.steps.uploadContactsFile.uploadFileChosen,
      };
    },
  },

  uploadPreview: {
    prev(state: ImportState) {
      return updateStep(
        { ...state, nextBlockingError: undefined },
        "uploadPreview",
        {
          nextClicked: false,
        }
      );
    },

    next(state: ImportState) {
      let stepData = state.steps.uploadPreview;
      // show the preview once again but with a confirm window
      if (
        !stepData.resultsOk &&
        !stepData.nextConfirmed &&
        !stepData.nextClicked
      ) {
        return updateStep(
          { ...state, stepNumber: getStepNumberByName("uploadPreview") - 1 },
          "uploadPreview",
          { nextClicked: true }
        );
      }
      return state;
    },

    enter: (state: ImportState) => {
      return updateStep({ ...state, loading: true }, "uploadPreview", {
        nextClicked: false,
        previewRefreshing: true,
      });
    },
  },

  uploadDetailsForm: {
    prev(state: ImportState) {
      return { ...state, saveConfirmed: false };
    },

    next(state: ImportState) {
      return {
        ...state,
        saveConfirmed: true,
        stepNumber: getStepNumberByName("uploadDetailsForm") - 1,
        loading: true,
      };
    },
    enter(state: ImportState) {
      return {
        ...state,
        allowNext: detailsFormValid(state),
      };
    },
  },
};

const stepsMap = [
  "downloadFileSample",
  "setUpImportFile",
  "uploadContactsFile",
  "uploadPreview",
  "uploadDetailsForm",
];

export const getStepNameByNumber = (number: number) => {
  return stepsMap[number - 1] ?? null;
};

export const getStepNumberByName = (name: string) => {
  return stepsMap.indexOf(name) + 1;
};
