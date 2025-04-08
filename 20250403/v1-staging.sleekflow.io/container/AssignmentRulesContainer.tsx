import React from "react";
import { PostLogin } from "../component/Header";
import AssignmentRules from "./AssignmentRules";

function AssignmentRulesContainer() {
  return (
    <div className={`post-login`}>
      <PostLogin selectedItem={"Assignment"} />
      <AssignmentRules />
    </div>
  );
}

export default AssignmentRulesContainer;
