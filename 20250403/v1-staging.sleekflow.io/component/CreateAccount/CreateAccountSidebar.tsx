import React, { useState, useContext, useEffect } from "react";
import { Header, Image } from "semantic-ui-react";
import Sleekflow_logo_2x from "../../assets/images/Sleekflow_logo_white_2x.svg";

export default () => {
  return (
    <div className="sidebar">
      <a href="https://sleekflow.io" target="_blank" className="logo">
        <Image src={Sleekflow_logo_2x} />
      </a>
      <div className="content">
        <div className="message">
          The Best Social CRM for Instant Messaging Automation
        </div>
      </div>
    </div>
  );
};
