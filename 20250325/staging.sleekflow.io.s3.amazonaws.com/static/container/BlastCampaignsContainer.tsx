import React from "react";
import { BlastCampaignList } from "../component/Broadcast/BlastCampaign/BlastCampaignList";
import { PostLogin } from "../component/Header";

function BlastCampaignsContainer() {
  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Campaigns"} />
      <BlastCampaignList />
    </div>
  );
}

export default BlastCampaignsContainer;
