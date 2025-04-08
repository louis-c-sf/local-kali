import React, { useContext, useEffect, useRef } from "react";
import LoginContext from "../context/LoginContext";
import { useAppDispatch, useAppSelector } from "../AppRootContext";

export default function NewMessageSound() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const newMessage = useAppSelector((s) => s.newMessage);
  const loginDispatch = useAppDispatch();

  useEffect(() => {
    if (newMessage && audioRef.current) {
      audioRef.current.volume = 1;
      audioRef.current
        .play()
        .then((res) => {
          loginDispatch({ type: "UPDATE_SOUND_STATUS", newMessage: false });
        })
        .catch((error) => {
          console.debug(`NewMessageSound error: ${error}`);
        });
    }
  }, [newMessage]);

  return (
    <audio ref={audioRef}>
      <source src="https://s3-ap-southeast-1.amazonaws.com/app.sleekflow.io/static/audio/chat_sound.mp3" />
    </audio>
  );
}
