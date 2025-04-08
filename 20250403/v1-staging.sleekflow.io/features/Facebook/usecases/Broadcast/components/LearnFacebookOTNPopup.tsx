import React from "react";
import { Modal } from "semantic-ui-react";
import LearnFacebookOTNContent from "../../Inbox/components/LearnFacebookOTNContent";
import learnFeatureStyles from "../../Inbox/components/LearnFacebookOTNContent.module.css";
import { CloseIcon } from "component/shared/modal/CloseIcon";

const LearnFacebookOTNPopup = (props: {
  openModal: boolean;
  onClose: () => void;
}) => {
  const { openModal, onClose } = props;
  return (
    <>
      {openModal && (
        <Modal
          open
          closeOnDimmerClick
          dimmer={true}
          className={learnFeatureStyles.modal}
          closeIcon={<CloseIcon />}
          onClose={onClose}
        >
          <LearnFacebookOTNContent hasButton={false} />
        </Modal>
      )}
    </>
  );
};
export default LearnFacebookOTNPopup;
