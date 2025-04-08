import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  DropdownItemProps,
  Icon,
  Image as ImageComponent,
  Popup,
  PopupProps,
} from "semantic-ui-react";
import ImgEn from "../../assets/images/locale/lang-en.svg";
import ImgCn from "../../assets/images/locale/lang-cn.svg";
import ImgHk from "../../assets/images/locale/lang-hk.svg";
import ImgPtBr from "../../assets/images/locale/lang-ptBR.svg";
import ImgDe from "../../assets/images/locale/lang-de.svg";
import ImgId from "../../assets/images/locale/lang-id.svg";
import ImgIt from "../../assets/images/locale/lang-it.svg";
import { useHistory, useLocation } from "react-router";
import WorldWideImg from "./assets/worldwide.svg";
import styles from "./LanguageDropdown.module.css";

export function LanguageDropdown(props: {
  menuClass?: string;
  popupPosition?: PopupProps["position"];
}) {
  const { i18n } = useTranslation();
  const { menuClass, popupPosition } = props;
  const history = useHistory();
  const location = useLocation();
  const triggerRef = useRef<HTMLDivElement>(null);
  const languageOptions: DropdownItemProps[] = [
    {
      value: "en-US",
      text: "English",
      content: (
        <div>
          <ImageComponent src={ImgEn} width={21} height={12} />
          <span className="text">English</span>
        </div>
      ),
    },
    {
      value: "zh-HK",
      text: "繁體中文",
      content: (
        <div>
          <ImageComponent src={ImgHk} width={21} height={14} />
          <span className="text">繁體中文</span>
        </div>
      ),
    },
    {
      value: "zh-CN",
      text: "简体中文",
      content: (
        <div>
          <ImageComponent src={ImgCn} width={21} height={14} />
          <span className="text">简体中文</span>
        </div>
      ),
    },
    {
      value: "pt-BR",
      text: "Português (BR)",
      content: (
        <div>
          <ImageComponent src={ImgPtBr} width={21} height={12} />
          <span className="text">Português (BR)</span>
        </div>
      ),
    },
    {
      value: "id-ID",
      text: "Bahasa Indonesia",
      content: (
        <div>
          <ImageComponent src={ImgId} width={21} height={12} />
          <span className="text">Bahasa Indonesia</span>
        </div>
      ),
    },
    {
      value: "de-DE",
      text: "Deutsch",
      content: (
        <div>
          <ImageComponent src={ImgDe} width={21} height={12} />
          <span className="text">Deutsch</span>
        </div>
      ),
    },
    {
      value: "it-IT",
      text: "Italiano",
      content: (
        <div>
          <ImageComponent src={ImgIt} width={21} height={12} />
          <span className="text">Italiano</span>
        </div>
      ),
    },
  ].map((item) => {
    return {
      ...item,
      onClick: async (e) => {
        e.preventDefault();
        const path = location.pathname.replace(`${i18n.language}`, item.value);
        i18n.changeLanguage(item.value, (error, t) => {
          history.push({
            pathname: path,
            search: location.search,
            state: location.state,
          });
        });
      },
    };
  });

  const selectedLangOption = languageOptions.find(
    (opt) => opt.value === i18n.language
  );

  return (
    <Popup
      className={`app basic flat shrink language-select dialog ${
        menuClass ?? ""
      }`}
      closeOnDocumentClick
      closeOnPortalMouseLeave
      closeOnTriggerMouseLeave={false}
      mountNode={document.body}
      mouseEnterDelay={400}
      offset={0}
      position={popupPosition ?? "bottom center"}
      on={["click"]}
      triggerRef={triggerRef}
      trigger={
        <div
          className={`language-select trigger ${
            menuClass === "mobile" ? menuClass : ""
          }`}
          ref={triggerRef}
        >
          {i18n.language && (
            <ImageComponent src={WorldWideImg} width={20} height={20} />
          )}
          <div className={styles.selectedLanguageLabel}>
            {selectedLangOption?.text}
          </div>
          <Icon name={"chevron down"} className={"app"} />
        </div>
      }
    >
      <Dropdown
        className={"static"}
        open
        options={languageOptions}
        value={i18n.language}
        trigger={<></>}
        icon={false}
      />
    </Popup>
  );
}
