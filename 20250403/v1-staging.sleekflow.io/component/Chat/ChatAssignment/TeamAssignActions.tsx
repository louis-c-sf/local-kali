import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePopperPopup } from "../../shared/popup/usePopperPopup";
import { Dropdown, Icon, Portal } from "semantic-ui-react";
import { findClosestParent } from "../../../utility/dom";
import { identical } from "ramda";
import { InfoTooltip } from "../../shared/popup/InfoTooltip";

function isInsidePopup(destination: HTMLElement, popupNode: HTMLElement) {
  return !!findClosestParent(destination, identical(popupNode));
}

export function TeamAssignActions(props: {
  onAssign: (type: string) => void;
  visible: boolean;
}) {
  const [openPopup, setOpenPopup] = useState(false);
  const [triggerNode, setTriggerNode] = useState<HTMLElement | null>(null);
  const { onAssign, visible } = props;
  const [popupNode, setPopupNode] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  usePopperPopup(
    {
      popupRef: popupNode,
      anchorRef: triggerNode,
      placement: "right-end",
      onClose: () => {
        setOpenPopup(false);
      },
    },
    [openPopup, visible]
  );

  useEffect(() => {
    if (!popupNode) {
      return;
    }

    function outHandler(event: MouseEvent) {
      if (popupNode && event.relatedTarget) {
        if (isInsidePopup(event.relatedTarget as HTMLElement, popupNode)) {
          return;
        }
      }
      setOpenPopup(false);
    }

    popupNode.addEventListener("mouseout", outHandler);
    return () => {
      popupNode?.removeEventListener("mouseout", outHandler);
    };
  }, [openPopup, visible, popupNode]);

  return (
    <>
      <div
        className={"item item-extras"}
        ref={setTriggerNode}
        onMouseOver={() => {
          setOpenPopup(true);
        }}
        onMouseOut={(event) => {
          if (popupNode && event.relatedTarget) {
            if (isInsidePopup(event.relatedTarget as HTMLElement, popupNode)) {
              return;
            }
          }
          setOpenPopup(false);
        }}
      >
        <div className={"action"}>
          <span>{t("chat.conversation.actions.assign.theTeam")}</span>{" "}
          <Icon name={"arrow right"} />
        </div>
      </div>
      {visible && openPopup && (
        <Portal mountNode={document.body} open>
          <div
            className={
              "app ui basic popup dialog visible mini flat-dropdown-like"
            }
            ref={setPopupNode}
          >
            <div className="ui dropdown static">
              <Dropdown.Menu open>
                <ItemTooltipped
                  offset={[0, 70]}
                  tooltip={t(
                    "automation.tooltip.form.assign.option.base.queue"
                  )}
                >
                  <div
                    className={"item"}
                    onClick={() => {
                      onAssign("queuebased");
                      setOpenPopup(false);
                    }}
                    children={t("chat.conversation.actions.assign.queue")}
                  />
                </ItemTooltipped>
                <ItemTooltipped
                  offset={[0, 70]}
                  tooltip={t(
                    "automation.tooltip.form.assign.option.base.unassigned"
                  )}
                >
                  <div
                    className={"item"}
                    onClick={() => {
                      onAssign("unassigned");
                      setOpenPopup(false);
                    }}
                    children={t("chat.conversation.actions.assign.all")}
                  />
                </ItemTooltipped>
              </Dropdown.Menu>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}

function ItemTooltipped(props: {
  children: JSX.Element;
  offset?: [number, number];
  tooltip: string;
}) {
  return (
    <InfoTooltip placement={"right"} trigger={props.children}>
      {props.tooltip}
    </InfoTooltip>
  );
}
