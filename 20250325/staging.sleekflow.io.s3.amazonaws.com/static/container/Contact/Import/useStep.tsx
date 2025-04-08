import React from "react";
import DownloadFileSample from "./Steps/DownloadFileSample";
import UploadContactsFile from "./Steps/UploadContactsFile";
import UploadPreview from "./Steps/UploadPreview";
import { ImportState } from "./contracts";
import UploadDetailsForm from "./Steps/UploadDetailsForm";
import SetUpImportFile from "./Steps/SetUpImportFile";

const useStep = (state: ImportState, importDispatch: any, history: any) => {
  switch (state.stepNumber) {
    case 1:
      return (
        <DownloadFileSample
          importDispatch={importDispatch}
          stepState={state.steps.downloadFileSample}
        />
      );

    case 2:
      return <SetUpImportFile />;

    case 3:
      return (
        <UploadContactsFile
          importState={state}
          importDispatch={importDispatch}
          stepState={state.steps.uploadContactsFile}
        />
      );

    case 4:
      return (
        <UploadPreview
          stepState={state.steps.uploadPreview}
          importDispatch={importDispatch}
          file={state.file}
          errors={state.errors}
        />
      );

    case 5:
      return (
        <UploadDetailsForm
          importDispatch={importDispatch}
          stepState={state.steps.uploadDetailsForm}
          state={state}
          history={history}
        />
      );
    default:
      throw new Error(`Wrong step number: ${state.stepNumber}`);
  }
};
export default useStep;
