import React, { useEffect, useReducer } from "react";
import { Button, Dimmer, Loader, Modal } from "semantic-ui-react";
import { PostLogin } from "../../../component/Header";
import Wizard from "./Wizard";
import importReducerFactory, { defaultState } from "./importReducerFactory";
import useStep from "./useStep";
import "../../../style/css/import_contacts.css";
import HideChatEmbed from "../../../utility/HideChatEmbed";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { useHistory } from "react-router-dom";

function ContactImport() {
  const history = useHistory();
  const { t } = useTranslation();
  const [importState, importDispatch] = useReducer(
    importReducerFactory(t),
    defaultState()
  );
  const { loading } = importState;
  const currentStep = useStep(importState, importDispatch, history);
  const { routeTo } = useRouteConfig();
  useEffect(() => {
    if (importState.cancelConfirmed) {
      history.push(routeTo("/contacts"));
    }
  });

  return (
    <>
      <div className="post-login">
        <HideChatEmbed />
        <PostLogin selectedItem={"Contacts"}>
          <Dimmer.Dimmable dimmed={loading}>
            <Wizard
              allowPrev={importState.allowPrev}
              allowNext={importState.allowNext}
              onPrevClick={() => {
                importDispatch({
                  type: "PREV_STEP",
                });
              }}
              onNextClick={() => {
                importDispatch({
                  type: "NEXT_STEP",
                });
              }}
              onCancelClick={() => {
                importDispatch({
                  type: "CANCEL",
                });
              }}
              stepNumber={importState.stepNumber}
              stepsTotal={importState.stepsTotal}
              nextError={importState.nextBlockingError}
            >
              {currentStep}
            </Wizard>
            <Dimmer inverted active={loading}>
              <Loader inverted active />
            </Dimmer>
          </Dimmer.Dimmable>
        </PostLogin>
      </div>
      <Modal
        open={importState.cancelRequested}
        closeOnDimmerClick={false}
        dimmer={"inverted"}
        className={"wizard-modal"}
        size={"tiny"}
        onClose={() => importDispatch({ type: "UNDO_CANCEL" })}
      >
        <Modal.Header className={"negative"}>
          {t("profile.list.import.modal.cancelConfirm.button.cancel")}
        </Modal.Header>
        <Modal.Content>
          {t("profile.list.import.modal.cancelConfirm.text")}
        </Modal.Content>
        <Modal.Actions>
          <Button
            primary
            onClick={() => importDispatch({ type: "CONFIRM_CANCEL" })}
          >
            {t("form.button.yes")}
          </Button>
          <Button onClick={() => importDispatch({ type: "UNDO_CANCEL" })}>
            {t("form.button.no")}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export default ContactImport;
