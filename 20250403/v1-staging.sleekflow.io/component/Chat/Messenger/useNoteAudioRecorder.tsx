import React, {
  useCallback,
  useDebugValue,
  useEffect,
  useRef,
  useState,
} from "react";
import moment from "moment";
import MediaRecorderPolyfill from "audio-recorder-polyfill";
import { clone } from "ramda";
import { useTranslation } from "react-i18next";

const MINUTE = 60 * 1000;

export function useNoteAudioRecorder(props: {
  onAudioRecorded: (
    data: Blob,
    mimeType: string,
    duration: moment.Duration
  ) => void;
  onError: (error: string) => void;
  onTick: (duration: moment.Duration) => void;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const cancelledRef = useRef(false);
  const recordedDataRef = useRef<Blob[]>([]);
  const durationRef = useRef<moment.Duration | null>(null);

  const { t } = useTranslation();

  useEffect(() => {
    if (window.MediaRecorder === undefined) {
      window.MediaRecorder = MediaRecorderPolyfill;
    }
    const bestMimeSupported = ["audio/webm", "audio/ogg", "audio/mp4"].find(
      MediaRecorder.isTypeSupported
    );
    if (!bestMimeSupported) {
      setBlockingError(t("chat.audio.error.mimeUnsupported"));
    }
    setMimeType(bestMimeSupported);
  }, []);

  useEffect(() => {
    if (blockingError) {
      return;
    }
    if (!isRecording) {
      return;
    }
    const microphoneStream = microphoneStreamRef.current;
    if (!(microphoneStream && microphoneStream.active)) {
      return;
    }

    recordedDataRef.current = [];

    try {
      recorderRef.current = new MediaRecorder(microphoneStream, {
        mimeType: mimeType,
        audioBitsPerSecond: 80 * 1024,
      });

      timerRef.current = setInterval(() => {
        if (durationRef.current) {
          durationRef.current = durationRef.current.add(1, "second");
          props.onTick(clone(durationRef.current));
        }
      }, 1000);
      recorderRef.current.addEventListener(
        "dataavailable",
        function (this, event) {
          if (cancelledRef.current) {
            return;
          }
          recordedDataRef.current.push(event.data);
        }
      );

      recorderRef.current.addEventListener("stop", function (this, event) {
        if (cancelledRef.current) {
          return;
        }
        const dataRecorded = new Blob(recordedDataRef.current, {
          type: this.mimeType,
        });
        props.onAudioRecorded(
          dataRecorded,
          this.mimeType,
          clone(durationRef.current!)
        );
      });

      recorderRef.current.start(1 * MINUTE);
      durationRef.current = moment.duration(0);
    } catch (e) {
      console.error("#rec effect", e, recorderRef.current);
      setIsRecording(false);
      destroy();
      props.onError(String(e));
    }
  }, [isRecording, blockingError]);

  const destroy = useCallback(async function () {
    console.debug(`#rec destroy`, recorderRef.current, timerRef.current);
    const recorder = recorderRef.current;
    if (recorder) {
      recorder.stop();
      recorder.stream.getAudioTracks().forEach((track) => track.stop());
    }
    recorderRef.current = null;
    microphoneStreamRef.current = null;
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
  }, []);

  useDebugValue(timerRef.current);

  return {
    isRecording,
    start: async () => {
      cancelledRef.current = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        microphoneStreamRef.current = stream;
        setIsRecording(true);
      } catch (e) {
        destroy();
        setIsRecording(false);
        throw e;
      }
    },
    cancel: () => {
      cancelledRef.current = true;
      setIsRecording(false);
      destroy();
    },
    complete: () => {
      console.debug(`#rec complete`);
      setIsRecording(false);
      destroy();
    },
    destroy: async () => {
      await destroy();
    },
  };
}
