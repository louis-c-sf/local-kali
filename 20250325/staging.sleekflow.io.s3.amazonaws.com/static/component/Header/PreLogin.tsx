import React, { useRef, useState } from "react";
import {
  Dropdown,
  DropdownItemProps,
  Icon,
  Image as ImageComponent,
  Popup,
} from "semantic-ui-react";
import Sleekflow_logo_2x from "../../assets/images/Black_logo.svg";
import { useHistory, useLocation } from "react-router";
import { LanguageDropdown } from "./LanguageDropdown";
import { Link } from "react-router-dom";
import useRouteConfig from "../../config/useRouteConfig";
import { Trans, useTranslation } from "react-i18next";
import WorldWideImg from "./assets/worldwide.svg";
import { getWhatsAppSupportUrl } from "utility/getWhatsAppSupportUrl";

interface PreLoginProps {
  isDisplaySignIn?: boolean | true;
  className?: string;
  rightSideNav?: React.ReactNode;
}

export default function PreLogin(props: PreLoginProps) {
  const { isDisplaySignIn, className } = props;
  const { routeTo } = useRouteConfig();
  const { t } = useTranslation();

  return (
    <div className="prelogin menu">
      <a href="/" target="_blank" className="logo">
        <ImageComponent src={Sleekflow_logo_2x} />
      </a>
      <div className="lang-dropdown-wrap">
        <LanguageDropdown
          menuClass={"prelogin-menu"}
          popupPosition={"bottom right"}
        />
        <LanguageDropdown menuClass="mobile" />
      </div>
      {props.rightSideNav}
      {isDisplaySignIn && (
        <Trans i18nKey={"form.signin.prompt.signin"}>
          <div>
            Have an account?
            <Link to={routeTo(`/signin`)}>Sign in</Link>
          </div>
        </Trans>
      )}
      {className === "create-form" && (
        <a
          className={"ui button small"}
          target={"_blank"}
          rel="noopener noreferrer"
          href={getWhatsAppSupportUrl(
            "Hi SleekFlow. I'd like to learn more about the platform."
          )}
        >
          {t("form.signin.action.help")}
        </a>
      )}
    </div>
  );
}

//depreciated
function LanguageDropdownMobile() {
  const { i18n } = useTranslation();
  const [langChosen, setLangChosen] = useState(i18n.language);
  const history = useHistory();
  const location = useLocation();
  const triggerRef = useRef<HTMLDivElement>(null);
  const languageOptions: DropdownItemProps[] = [
    {
      value: "en-US",
      text: "English",
      content: (
        <div>
          <span className="text">English</span>
        </div>
      ),
    },
    // todo add HK translations
    {
      value: "zh-HK",
      text: "繁體中文",
      content: (
        <div>
          <span className="text">繁體中文</span>
        </div>
      ),
    },
    {
      value: "zh-CN",
      text: "简体中文",
      content: (
        <div>
          <span className="text">简体中文</span>
        </div>
      ),
    },
  ].map((item) => {
    return {
      ...item,
      onClick: async () => {
        const path = location.pathname.replace(`${i18n.language}`, item.value);
        i18n.changeLanguage(item.value).then(() => {
          setLangChosen(item.value);
          history.push({
            pathname: path,
            search: location.search,
            state: location.state,
          });
        });
      },
    };
  });
  return (
    <Popup
      className={`app basic flat shrink language-select dialog mobile`}
      closeOnDocumentClick
      closeOnPortalMouseLeave
      closeOnTriggerMouseLeave={false}
      mountNode={document.body}
      mouseEnterDelay={400}
      offset={0}
      position={"bottom center"}
      on={["click"]}
      triggerRef={triggerRef}
      trigger={
        <div className={"language-select trigger mobile"} ref={triggerRef}>
          <ImageComponent src={WorldWideImg} />
          {languageOptions.find((l) => l.value === langChosen)?.text}
          <Icon name={"chevron down"} className={"app"} />
        </div>
      }
    >
      <Dropdown
        className={"static"}
        open
        options={languageOptions}
        value={langChosen}
        trigger={<></>}
        icon={false}
      />
    </Popup>
  );
}
