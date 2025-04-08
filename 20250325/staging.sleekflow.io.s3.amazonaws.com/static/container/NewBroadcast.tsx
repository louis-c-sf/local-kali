import React from "react";
import { PostLogin } from "../component/Header";
import { RouteComponentProps } from "react-router-dom";
import { NewBroadcastMain } from "../component/Broadcast/NewBroadcastMain";

function NewBroadcast({ match, history }: RouteComponentProps<any>) {
  const { id } = match.params;

  let newBroadcastMatchState = history.location.state as {
    matchedListIds: number[] | undefined;
  };

  return (
    <div className="post-login">
      <PostLogin selectedItem={"Campaigns"} />
      <NewBroadcastMain
        id={id}
        contactListIds={newBroadcastMatchState?.matchedListIds ?? []}
      />
    </div>
  );
}

export default NewBroadcast;
