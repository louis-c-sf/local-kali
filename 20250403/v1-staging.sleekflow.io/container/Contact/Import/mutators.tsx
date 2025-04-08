import {
  DownloadFileSampleState,
  ImportState,
  SharesFileRef,
  StepName,
  UploadContactsFileState,
  UploadDetailsFormState,
  UploadPreviewState,
} from "./contracts";

import stepsFlow, { getStepNameByNumber } from "./stepsFlow";

export const updateStep = <TStep extends keyof ImportState["steps"]>(
  state: ImportState,
  stepName: TStep,
  stepData: Partial<ImportState["steps"][TStep]>
): ImportState => {
  let stepDataCurrent = state.steps[stepName];
  let stepDataUpdated = { ...stepDataCurrent, ...stepData };
  return {
    ...state,
    steps: {
      ...state.steps,
      ...{ [stepName]: stepDataUpdated },
    },
  };
};

function moveStepBack(state: ImportState): ImportState {
  const stepName = getStepNameByNumber(state.stepNumber);
  if (!stepName) {
    return state;
  }
  const leaveHandler = stepsFlow[stepName].prev;
  state = leaveHandler(state);

  const prevStepName = getStepNameByNumber(state.stepNumber - 1);
  if (!prevStepName) {
    return state;
  }

  // if step stays the same, skip re-entering
  if (prevStepName === stepName) {
    return state;
  }
  const enterHandler = stepsFlow[prevStepName].enter;
  return enterHandler(state);
}

function moveStepForward(state: ImportState): ImportState {
  const stepName = getStepNameByNumber(state.stepNumber);

  if (!stepName) {
    return state;
  }
  const leaveHandler = stepsFlow[stepName].next;
  state = leaveHandler(state);

  const nextStepName = getStepNameByNumber(state.stepNumber + 1);
  if (!nextStepName) {
    return state;
  }

  // if step stays the same, skip re-entering
  if (nextStepName === stepName) {
    return state;
  }
  const enterHandler = stepsFlow[nextStepName].enter;
  return enterHandler(state);
}

export function prevStep(state: ImportState) {
  state = moveStepBack(state);
  let stepNumber = state.stepNumber - 1;
  stepNumber = stepNumber > 0 ? stepNumber : 1;

  return { ...state, errors: [], stepNumber: stepNumber };
}

export function nextStep(state: ImportState) {
  state = moveStepForward(state);
  let stepNumber = state.stepNumber + 1;
  stepNumber = stepNumber <= state.stepsTotal ? stepNumber : state.stepsTotal;

  return { ...state, errors: [], stepNumber: stepNumber };
}
