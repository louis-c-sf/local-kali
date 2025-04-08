import produce from "immer";

export type AudioState = {
  position: number;
  name: string;
  state: "init" | "downloading" | "playing" | "paused" | "finished";
};
export type AudioAction =
  | { type: "DOWNLOAD_STARTED" }
  | { type: "DOWNLOAD_COMPLETED" }
  | { type: "PLAY" }
  | { type: "POSITION_UPDATED"; position: number }
  | { type: "PAUSE" }
  | { type: "FINISH" };
export const audioPlayerReducer = produce(
  (draft: AudioState, action: AudioAction) => {
    switch (action.type) {
      case "DOWNLOAD_STARTED":
        draft.state = "downloading";
        break;
      case "DOWNLOAD_COMPLETED":
        draft.position = 0;
        draft.state = "paused";
        break;
      case "PLAY":
        draft.state = "playing";
        break;
      case "PAUSE":
        draft.state = "paused";
        break;
      case "POSITION_UPDATED":
        draft.position = action.position;
        break;
      case "FINISH":
        draft.state = "paused";
        break;
    }
  }
);
