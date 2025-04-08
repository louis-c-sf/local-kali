import React from "react";
import { Image } from "semantic-ui-react";
import Sleekflow_logo_2x from "../assets/images/Sleekflow_logo_2x.svg";
export default () => {
  return (
    <a target="_blank" className="logo" href="https://sleekflow.io">
      <Image src={Sleekflow_logo_2x} />
    </a>
  );
};
