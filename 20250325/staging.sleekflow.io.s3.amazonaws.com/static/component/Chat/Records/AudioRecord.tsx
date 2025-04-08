import React, { Reducer, useEffect, useReducer, useRef } from "react";
import MessageType from "../../../types/MessageType";
import { Icon, Loader, Progress } from "semantic-ui-react";
import moment from "moment";
import { padStart } from "lodash-es";
import { useChatControls } from "../utils/useChatControls";
import {
  AudioAction,
  audioPlayerReducer,
  AudioState,
} from "./audioPlayerReducer";
import { MessageQuoted } from "../Messenger/MessageQuoted";
import MessageRecord, { getSenderProfilePic } from "./MessageRecord";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import MessageContent from "./MessageContent";
import { getUploadedAttachment } from "../../../api/Broadcast/getUploadedAttachment";
import { useAppSelector } from "AppRootContext";
import { MessageRecordCommonProps } from "component/Chat/Records/MessageRecord/MessageRecordBase";

export const AUDIO_TYPES = {
  "audio/webm": {
    extension: "webm",
  },
  "audio/ogg": {
    extension: "ogg",
  },
  "audio/mpeg": {
    extension: "mp3",
  },
  "audio/mp3": {
    extension: "mp3",
  },
  "audio/wav": {
    extension: "wav",
  },
};

export function formatDuration(totalTime: number) {
  const durationParsed = moment.duration(totalTime, "second");
  const minutes = padStart(String(durationParsed.minutes()), 2, "0");
  const seconds = padStart(String(durationParsed.seconds()), 2, "0");
  return [minutes, seconds];
}

export default function AudioRecord(
  props: MessageRecordCommonProps & {
    messageQuoted?: MessageType;
    onStart: (id: string) => void;
    onStop: (id: string) => void;
    onFinish: (id: string) => void;
    currentlyPlayingId: string | undefined;
    startAudioId: string | undefined;
    userId: string;
    pickingMessagesActive: boolean;
  }
) {
  const [state, dispatch] = useReducer<Reducer<AudioState, AudioAction>>(
    audioPlayerReducer,
    {
      name: "",
      position: 0,
      state: "init",
    }
  );

  const {
    message,
    isShowIcon,
    currentlyPlayingId,
    startAudioId,
    t,
    userId,
    pickingMessagesActive,
    senderName,
  } = props;
  const playerRef = useRef<HTMLAudioElement | null>(null);
  const progressTimerRef = useRef<NodeJS.Timer | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const [file] = message.uploadedFiles;

  const { whenUIUnlocked } = useChatControls();
  const flash = useFlashMessageChannel();

  useEffect(() => {
    if (!playerRef.current || !isActive()) {
      return;
    }
    const onEnded = () => {
      dispatch({ type: "FINISH" });
      props.onFinish(props.message.messageUniqueID);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
    playerRef.current.addEventListener("ended", onEnded);
  }, [playerRef.current, isActive()]);

  useEffect(() => {
    if (!playerRef.current || isActive()) {
      return;
    }
    const player = playerRef.current;
    const onLoaded = () => {
      dispatch({ type: "DOWNLOAD_COMPLETED" });
      handlePlay();
    };
    player.addEventListener("loadedmetadata", onLoaded);
  }, [playerRef.current, isActive()]);

  useEffect(() => {
    if (!progressBarRef.current || !isActive()) {
      return;
    }
    progressBarRef.current.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!playerRef.current) {
        return;
      }
      const progressNode = progressBarRef.current!.querySelector(".progress");
      const progressBounds = progressNode!.getBoundingClientRect();
      const totalWidth = progressBounds.width;
      const x = event.pageX - (progressBounds.left + window.scrollX);
      const proportion = x / totalWidth;
      const newPosition = playerRef.current.duration * proportion;
      playerRef.current.currentTime = newPosition;
    });
  }, [progressBarRef.current, isActive()]);

  useEffect(() => {
    if (!isActive()) {
      return;
    }
    if (currentlyPlayingId !== message.messageUniqueID) {
      pause();
    }
  }, [currentlyPlayingId]);

  useEffect(() => {
    if (!playerRef.current || !startAudioId) {
      return;
    }

    if (state.state !== "playing" && startAudioId === message.messageUniqueID) {
      if (state.state === "init") {
        handleDownload();
      } else if (["paused", "finished"].includes(state.state)) {
        handlePlay();
      }
    } else {
      if (state.state !== "init") {
        handlePause();
      }
    }
  }, [playerRef.current, state.state, startAudioId]);

  function isActive() {
    return ["paused", "playing", "finished"].includes(state.state);
  }

  const currentTime = playerRef.current?.currentTime ?? 0;
  const totalTime = isNaN(playerRef.current?.duration as number)
    ? 0
    : playerRef.current!.duration;
  const percent = totalTime ? (currentTime / totalTime) * 100 : 0;
  const [minutes, seconds] = formatDuration(totalTime);

  const senderPic = useAppSelector((s) =>
    getSenderProfilePic(props.message, s.staffList)
  );

  function handlePlay() {
    if (playerRef.current) {
      dispatch({ type: "PLAY" });
      props.onStart(props.message.messageUniqueID);
      playerRef.current.muted = false;
      playerRef.current.volume = 1;
      progressTimerRef.current = setInterval(() => {
        if (playerRef.current) {
          dispatch({
            type: "POSITION_UPDATED",
            position: playerRef.current.currentTime,
          });
        }
      }, 200);
      playerRef.current.play().catch(() => {
        if (progressTimerRef.current !== null) {
          dispatch({ type: "PAUSE" });
          clearInterval(progressTimerRef.current);
        }
      });
    }
  }

  function handlePause() {
    props.onStop(props.message.messageUniqueID);
    pause();
  }

  function pause() {
    dispatch({ type: "PAUSE" });
    playerRef.current?.pause();
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
  }

  function handleDownload() {
    const filename = file.filename;
    const baseName = filename.substring(filename.lastIndexOf("/") + 1);
    getUploadedAttachment(file.fileId, "message", baseName)
      .then((res) => {
        if (res) {
          playerRef.current!.src = res;
          dispatch({ type: "DOWNLOAD_STARTED" });
        }
      })
      .catch((error) => {
        flash(t("flash.audio.error"));
        console.error(`error: ${error}`);
      });
  }

  return (
    <MessageRecord
      message={message}
      messageQuoted={props.messageQuoted}
      isShowIcon={isShowIcon}
      profile={props.profile}
      messageClasses={["audio"]}
      channelTitle={props.channelTitle}
      channelTypeName={props.channelTypeName}
      t={t}
      userId={userId}
      pickingMessagesActive={pickingMessagesActive}
      senderName={senderName}
      senderPic={senderPic}
      beforeContent={props.beforeContent}
    >
      <>
        {(props.messageQuoted || message.quotedMsgBody) && (
          <MessageQuoted
            message={props.messageQuoted || message.quotedMsgBody}
          />
        )}
        <audio controls={false} preload={"metadata"} ref={playerRef} />
        <div className="player">
          {state.state === "downloading" && (
            <Loader active size={"tiny"} inline />
          )}
          {state.state === "init" && (
            <span
              className="button play"
              onClick={whenUIUnlocked(handleDownload)}
            >
              <Icon name={"play"} />
            </span>
          )}
          {state.state === "paused" && (
            <span className="button play" onClick={whenUIUnlocked(handlePlay)}>
              <Icon name={"play"} />
            </span>
          )}
          {state.state === "playing" && (
            <span className="button play" onClick={handlePause}>
              <Icon name={"pause"} />
            </span>
          )}
          <div ref={progressBarRef} className={"progress-wrap"}>
            <Progress active={false} percent={percent} disabled={!isActive()} />
          </div>
          <span className="time">
            {minutes}:{seconds}
          </span>
        </div>
        <div className={`message-content`}>
          <MessageContent message={message.messageContent} />
        </div>
      </>
    </MessageRecord>
  );
}
