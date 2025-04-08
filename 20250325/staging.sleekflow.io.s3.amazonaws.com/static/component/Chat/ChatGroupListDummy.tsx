import React, { useContext, useEffect, useState, useRef } from "react";
import { Placeholder } from "semantic-ui-react";

const ChatGroupListDummy = () => {
  let rowSteps = 10;
  return (
    <div className="chatsScroll">
      <div className="ui items">
        {Array(rowSteps)
          .fill(1)
          .map((_, i) => (
            <div
              className="item"
              style={{ opacity: (rowSteps - i) / 10 }}
              key={i}
            >
              <div className="ui tiny circular image">
                <Placeholder>
                  <Placeholder.Image />
                </Placeholder>
              </div>
              <div className="content">
                <div className="header">
                  <Placeholder className="name">
                    <Placeholder.Line length={"full"} />
                  </Placeholder>
                </div>
                <div className="description">
                  <Placeholder className="last-message">
                    <Placeholder.Line length={"full"} />
                  </Placeholder>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
export default ChatGroupListDummy;
