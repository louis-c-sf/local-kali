import React, { useState } from "react";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import moment from "moment";
import { useNoteAudioRecorder } from "./useNoteAudioRecorder";
import { padStart } from "lodash-es";
import { Button } from "semantic-ui-react";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export const AudioNote = React.memo(function AudioNote(props: {
  onAudioRecord: () => void;
  onAudioRecorded: (
    data: Blob,
    mimeType: string,
    duration: moment.Duration
  ) => void;
}) {
  const flash = useFlashMessageChannel();
  const [duration, setDuration] = useState<moment.Duration>(moment.duration(0));
  let { cancel, complete, isRecording, start } = useNoteAudioRecorder({
    onAudioRecorded: (data, mimeType, duration) => {
      props.onAudioRecorded(data, mimeType, duration);
    },
    onError: (error) => {
      console.error("#rec onError", error);
    },
    onTick: (duration) => {
      setDuration(duration);
    },
  });
  const { t } = useTranslation();

  async function handleStartRecord() {
    try {
      setDuration(moment.duration(0));
      props.onAudioRecord();
      await start();
    } catch (e) {
      console.error("#rec handleStartRecord", e);
      let errorMessage = "";

      if (e instanceof DOMException) {
        switch (e.name) {
          case "AbortError":
            errorMessage = t("chat.audio.error.AbortError");
            break;

          case "NotAllowedError":
          case "SecurityError":
            errorMessage = t("chat.audio.error.SecurityError");
            break;

          case "NotFoundError":
          case "OverconstrainedError":
            errorMessage = t("chat.audio.error.NotFoundError");
            break;

          case "TypeError":
            errorMessage = t("chat.audio.error.TypeError");
            break;

          default:
            errorMessage = htmlEscape(`${e.name} / ${e.message}`);
            break;
        }
        if (errorMessage) {
          flash(errorMessage);
        }
      }
    }
  }

  async function handleConfirmRecord() {
    await complete();
  }

  async function handleCancelRecord() {
    await cancel();
  }

  const minutes = duration.minutes().toFixed(0);
  const seconds = duration.seconds().toFixed(0);

  return (
    <div className={`audio-note ${isRecording ? "recording" : ""}`}>
      {isRecording ? (
        <div className={"recorder"}>
          <i className={"ui icon record-cancel"} onClick={handleCancelRecord} />
          <span className={"timer"}>
            <i className={"ui icon record-indicator"} />
            <span className={"digits"}>
              {`${padStart(minutes, 2, "0")}:${padStart(seconds, 2, "0")}`}
            </span>
          </span>
          <i className={"ui icon record-ok"} onClick={handleConfirmRecord} />
        </div>
      ) : (
        <RecordButton onClick={handleStartRecord} />
      )}
    </div>
  );
});

function RecordButton(props: { onClick: () => Promise<void> }) {
  const { t } = useTranslation();
  return (
    <InfoTooltip
      placement="top"
      className="info-tooltip"
      children={t("chat.actions.audio.add")}
      offset={[70, 10]}
      trigger={
        <Button onClick={props.onClick}>
          <i className={"ui icon audio-toggle-icon"} />
        </Button>
      }
    />
  );
}
