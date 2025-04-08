import { WhatsappChannelType } from "../../types";
import { useTranslation, Trans } from "react-i18next";
import { useSelectWhatsappTemplateFlow } from "../useSelectWhatsappTemplateFlow";
import React, { useEffect, useState } from "react";
import { Image, Menu, MenuItemProps } from "semantic-ui-react";
import styles from "./TopControls.module.css";
import Star from "../../../../../assets/tsx/icons/Star";
import { NavLink } from "react-router-dom";
import { TemplateSelectionEnum, TemplateCategoryTabEnum } from "./SelectMode";
import RefreshImg from "../assets/refresh.svg";
import RefreshLoadingImg from "../assets/refreshLoading.svg";
import { TFunction } from "i18next";
import { Icon } from "component/shared/Icon/Icon";

const getTemplatesSelectedTabItems = (
  t: TFunction,
  hiddenBookmarked: boolean,
  hiddenTab: { [key in TemplateCategoryTabEnum]: boolean }
): Array<MenuItemProps> => [
  {
    key: 0,
    text: t("chat.selectWhatsappTemplate.bookmarked"),
    content: (
      <div className={styles.bookmarked}>
        <Star className={styles.star} />
        {t("chat.selectWhatsappTemplate.bookmarked")}
      </div>
    ),
    disabled: hiddenBookmarked,
    name: "bookmarked",
  },
  {
    key: 1,
    text: t("chat.selectWhatsappTemplate.templates"),
    content: t("chat.selectWhatsappTemplate.templates"),
    name: "templates",
  },
  {
    key: 2,
    text: t("chat.selectWhatsappTemplate.marketing"),
    content: t("chat.selectWhatsappTemplate.marketing"),
    disabled: hiddenTab.marketing,
    name: "marketing",
  },
  {
    key: 3,
    text: t("chat.selectWhatsappTemplate.utility"),
    content: t("chat.selectWhatsappTemplate.utility"),
    disabled: hiddenTab.utility,
    name: "utility",
  },
  {
    key: 4,
    text: t("chat.selectWhatsappTemplate.authentication"),
    content: t("chat.selectWhatsappTemplate.authentication"),
    disabled: hiddenTab.authentication,
    name: "authentication",
  },
];

export function TopControls(props: {
  fromConversationId: string;
  showEdit: boolean;
  hasTemplates: boolean;
  onTabChange: (template: TemplateSelectionEnum) => void;
  selectedChannelFromConversation: WhatsappChannelType;
  loading: boolean;
  isDisplayRefresh: boolean;
  refreshTemplates?: () => void;
  hiddenCategoryTabs: { [key in TemplateCategoryTabEnum]: boolean };
  canBookmarkTemplates: boolean;
}) {
  const { t } = useTranslation();
  const {
    showEdit,
    fromConversationId,
    selectedChannelFromConversation,
    hasTemplates,
    loading,
    hiddenCategoryTabs,
  } = props;

  const { editTemplatesUrl } =
    useSelectWhatsappTemplateFlow(fromConversationId);
  const [selectedTab, setSelectedTab] =
    useState<TemplateSelectionEnum>("bookmarked");
  const isCurrentChannelBookmarkedDisabled = !props.canBookmarkTemplates;
  const templatesSelectedTabItems = getTemplatesSelectedTabItems(
    t,
    isCurrentChannelBookmarkedDisabled,
    hiddenCategoryTabs
  );

  useEffect(() => {
    if (!hasTemplates) {
      return;
    }
    if (selectedTab && isCurrentChannelBookmarkedDisabled) {
      if (selectedTab === "bookmarked") {
        setSelectedTab("templates");
      }
    }
  }, [selectedTab, selectedChannelFromConversation, hasTemplates]);

  useEffect(() => {
    props.onTabChange(selectedTab);
  }, [selectedTab]);

  function onItemClick(_: any, data: MenuItemProps) {
    if (!data.name) {
      return;
    }
    setSelectedTab(data.name as TemplateSelectionEnum);
  }

  return (
    <>
      <div className={styles.header}>
        <div>{t("chat.selectWhatsappTemplate.title")}</div>
        <div className={styles.action}>
          {selectedChannelFromConversation &&
            ["whatsapp360dialog", "whatsappcloudapi"].includes(
              selectedChannelFromConversation
            ) &&
            props.isDisplayRefresh &&
            props.refreshTemplates &&
            (loading ? (
              <div className={styles.disabled}>
                <Image
                  className={styles.refreshImage}
                  src={RefreshLoadingImg}
                />
                {t("form.button.loading")}
              </div>
            ) : (
              <a onClick={props.refreshTemplates} className={styles.refresh}>
                <Image className={styles.refreshImage} src={RefreshImg} />
                {t("chat.selectWhatsappTemplate.button.refresh")}
              </a>
            ))}
          {showEdit && (
            <NavLink to={editTemplatesUrl}>
              <div className={styles.edit}>
                {t("chat.selectWhatsappTemplate.button.edit")}
              </div>
            </NavLink>
          )}
        </div>
      </div>
      <div className={styles.tipWrapper}>
        <div className={styles.tipTitleWrapper}>
          <Icon type="tips" />
          <span className={styles.title}>
            {t("chat.selectWhatsappTemplate.tips.title")}
          </span>
        </div>
        <div className={styles.tipBody}>
          <Trans i18nKey={"chat.selectWhatsappTemplate.tips.description"}>
            You can send templates from the same category within 24 hours to
            avoid extra charges. When the conversation is user-initiated,
            sending templates will incur extra charges. Click
            <a
              href="https://sleekflow.io/blog/whatsapp-business-price"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            to learn more about our latest pricing update.
          </Trans>
        </div>
      </div>
      <div className={styles.topControls}>
        <Menu
          pointing
          secondary
          vertical={false}
          items={templatesSelectedTabItems.filter((item) => !item.disabled)}
          onItemClick={onItemClick}
          activeIndex={templatesSelectedTabItems
            .filter((item) => !item.disabled)
            .findIndex((i) => i.name === selectedTab)}
        />
      </div>
    </>
  );
}
