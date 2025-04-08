import React from "react";
import { PostLogin } from "../component/Header";
import BroadcastContent from "./BroadcastContent";

function Broadcast() {
  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Campaigns"} />
      <BroadcastContent />
    </div>
  );
}

export default Broadcast;
