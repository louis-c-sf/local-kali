import React, { Reducer, useReducer, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "./HelpCenter.module.css";
import { HelpCenterDrawer } from "./HelpCenterDrawer";
import { helpCenterReducer } from "./hooks/helpCenterReducer";
import { HelpCenterContext } from "./hooks/helpCenterContext";
import {
  getDefaultStateValue,
  HelpCenterActionType,
  HelpCenterStateType,
  StepsEnum,
} from "./hooks/HelpCenterStateType";
import { useCurrentPath } from "./hooks/useCurrentPath";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";

const HelpCenterWidget = () => {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer<
    Reducer<HelpCenterStateType, HelpCenterActionType>
  >(helpCenterReducer, {
    ...getDefaultStateValue(),
  });
  const { currentPath } = useCurrentPath();
  const sideBarNode = document.querySelector(".sidebar-area");
  const rootNode = document.querySelector("#root");
  const helpCenter = useAppSelector((s) => s.helpCenter);
  const loginDispatch = useAppDispatch();

  const close = useCallback(() => {
    sideBarNode?.classList.remove(styles.helpCenter);
    dispatch({ type: "HIDE_HELP_CENTER_WIDGET" });
    loginDispatch({ type: "HIDDEN_HELP_CENTER" });
  }, [sideBarNode, dispatch, loginDispatch]);

  useEffect(() => {
    if (helpCenter.visible) {
      dispatch({
        type: "SHOW_HELP_CENTER_WIDGET",
        step: helpCenter.step as StepsEnum,
      });
    }
  }, [helpCenter.visible, helpCenter.step]);

  const addRootClassName = useCallback(() => {
    sideBarNode?.classList.add(styles.helpCenter);
  }, [sideBarNode]);

  useEffect(() => {
    close();
  }, [currentPath]);
  return (
    <HelpCenterContext.Provider value={{ state, dispatch }}>
      <>
        <div
          style={{
            top: `calc(100vh - ${
              rootNode ? 55 + (rootNode as HTMLElement).offsetTop : 70
            }px)`,
          }}
          className={styles.helpCenterContainer}
          onClick={() => {
            dispatch({ type: "SHOW_HELP_CENTER_WIDGET" });
          }}
        >
          <div>
            <svg
              width={28}
              height={28}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 .875C6.752.875.875 6.752.875 14S6.752 27.125 14 27.125 27.125 21.248 27.125 14 21.248.875 14 .875Zm1.184 19.143c-.03 1.043-.803 1.687-1.805 1.658-.961-.03-1.717-.715-1.688-1.764.03-1.043.827-1.705 1.787-1.676 1.008.03 1.74.739 1.706 1.782Zm2.853-7.46c-.246.346-.797.792-1.488 1.33l-.768.528c-.375.287-.61.627-.732 1.014-.065.205-.111.738-.123 1.095-.006.07-.047.229-.264.229h-2.29c-.241 0-.27-.14-.265-.211.036-.973.176-1.775.58-2.42.545-.867 2.08-1.781 2.08-1.781.235-.176.417-.364.557-.569.258-.351.469-.744.469-1.166 0-.486-.117-.949-.428-1.336-.363-.45-.756-.667-1.511-.667-.745 0-1.178.375-1.489.867-.31.492-.258 1.072-.258 1.6H9.254c0-1.993.521-3.264 1.623-4.014.744-.51 1.693-.733 2.8-.733 1.454 0 2.608.27 3.628 1.043.943.715 1.441 1.723 1.441 3.082 0 .838-.293 1.541-.709 2.11Z"
                fill="#fff"
              />
            </svg>
          </div>
          <div>{t("nav.menu.helpCenter")}</div>
        </div>
        <HelpCenterDrawer addRootClassName={addRootClassName} close={close} />
      </>
    </HelpCenterContext.Provider>
  );
};
const HelpCenterMemo = React.memo(HelpCenterWidget);
export default HelpCenterMemo;
