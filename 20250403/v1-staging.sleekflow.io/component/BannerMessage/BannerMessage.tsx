import React, { useEffect } from "react";
import CloseIcon from "../../assets/images/x-icon-white.svg";
import { Image, TransitionablePortal } from "semantic-ui-react";
import { useHistory, useLocation } from "react-router";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";

export default BannerMessage;

function BannerMessage() {
  const loginDispatch = useAppDispatch();
  const isVisible = useAppSelector((s) => !s.hideBannerMessage);
  const content = useAppSelector((s) => s.bannerMessage);

  const closeBannerMessage = () => {
    loginDispatch({
      type: "HIDE_BANNER_MESSAGE",
    });
  };

  // show the latest flash message pushed
  const history = useHistory();
  const currentLocation = useLocation<{
    flashMessage?: { text: string; timeout?: number };
  }>();
  const { state } = currentLocation;

  useEffect(() => {
    if (state?.flashMessage) {
      closeBannerMessage();

      setTimeout(() => {
        closeBannerMessage();
        const { flashMessage, ...rest } = state;
        history.replace({
          ...currentLocation,
          state: rest,
        });
      }, state?.flashMessage?.timeout ?? 2000);
    }
  }, [state?.flashMessage?.text]);

  return (
    <TransitionablePortal
      transition={{
        animation: "fade up",
        duration: 500,
      }}
      open={isVisible}
      closeOnDocumentClick={false}
      mountNode={document.getElementById("root")}
    >
      <div className={`banner-message-wrap`}>
        <div className={`banner-message`}>
          <span
            className="text"
            dangerouslySetInnerHTML={{
              __html: typeof content === "string" ? content || "" : "",
            }}
          />
          <Image
            src={CloseIcon}
            onClick={closeBannerMessage}
            className={"btn-dismiss"}
          />
        </div>
      </div>
    </TransitionablePortal>
  );
}
