import React, { useEffect, useState } from "react";
import { Modal } from "semantic-ui-react";
import LearnFacebookOTNContent from "./LearnFacebookOTNContent";
import SendRequestContent from "./SendRequestContent";
import {
  ModalSceneDicEnum,
  ModalSceneDic,
} from "../../../models/FacebookOTNTypes";
import learnFeatureStyles from "./LearnFacebookOTNContent.module.css";
import sendRequestStyles from "./SendRequestContent.module.css";
import { CloseIcon } from "component/shared/modal/CloseIcon";

const ModalWrapper = (props: {
  onClose: () => void;
  pageId: string | undefined;
  fbReceiverId: string | undefined;
  conversationId: string | undefined;
}) => {
  const opened = localStorage.getItem("opened_learn_facebookOTN_modal");
  const [scene, setScene] = useState<ModalSceneDicEnum>(
    opened ? ModalSceneDic.sendRequest : ModalSceneDic.learnFeature
  );
  useEffect(() => {
    if (!opened) {
      localStorage.setItem("opened_learn_facebookOTN_modal", "true");
    }
  }, [opened]);

  return (
    <Modal
      open
      closeOnDimmerClick
      dimmer={true}
      className={
        scene === ModalSceneDic.learnFeature
          ? learnFeatureStyles.modal
          : sendRequestStyles.modal
      }
      closeIcon={<CloseIcon />}
      onClose={props.onClose}
    >
      {scene === ModalSceneDic.learnFeature ? (
        <LearnFacebookOTNContent
          handleOnClick={() => setScene(ModalSceneDic.sendRequest)}
        />
      ) : (
        <SendRequestContent
          pageId={props.pageId}
          fbReceiverId={props.fbReceiverId}
          conversationId={props.conversationId}
          onClose={() => props.onClose()}
        />
      )}
    </Modal>
  );
};
export default ModalWrapper;
