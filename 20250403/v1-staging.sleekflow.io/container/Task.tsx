import React from "react";
import { PostLogin } from "../component/Header";
import { Image } from "semantic-ui-react";
import TaskImg from "../assets/images/task.png";

const Task = () => {
  return (
    <div className="post-login">
      <PostLogin selectedItem={"Task"} />
      <Image className="task-image" src={TaskImg} />
    </div>
  );
};

export default Task;
