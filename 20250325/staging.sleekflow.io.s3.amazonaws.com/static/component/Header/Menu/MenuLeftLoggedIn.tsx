import { Menu } from "semantic-ui-react";
import { matchPath, useLocation } from "react-router-dom";
import React, { useEffect, useState, useCallback, ReactNode } from "react";
import { havingActiveBillRecord } from "../../Channel/ChannelSelection";
import { ExcludedAddOn } from "../../Settings/SettingPlanSubscription/SettingPlan/SettingPlan";
import { useMainMenus, MainMenuItemType } from "./localizable/useMainMenus";
import { useAppSelector } from "../../../AppRootContext";
import { BaseMenuItem, InboxMenuItem } from "./item/InboxMenuItem";
import { equals } from "ramda";
import { SubMenu } from "./SubMenu";

export interface MenuItemType {
  name: string;
  title: string;
  component?: JSX.Element;
  path?: string;
  icon?: ReactNode;
  url?: string;
  external?: boolean;
}

const MenuLeftLoggedIn = (props: {
  newMessagesCounter: number | undefined;
  selectedLink: string;
  setSelectedLink: (value: string) => void;
}) => {
  const location = useLocation();
  const { selectedLink, setSelectedLink, newMessagesCounter } = props;
  const user = useAppSelector((s) => s.user, equals);
  const company = useAppSelector((s) => s.company, equals);
  const loggedInUserDetail = useAppSelector(
    (s) => s.loggedInUserDetail,
    equals
  );
  const [isStandardBillRecord, setIsStandardBillRecord] = useState(false);
  const { roleDisplayMenuItem } = useMainMenus();

  useEffect(() => {
    if (company) {
      if (company?.billRecords.length > 0) {
        const latesttBillRecord = company.billRecords
          .filter(ExcludedAddOn)
          .find(havingActiveBillRecord);
        setIsStandardBillRecord(
          latesttBillRecord?.subscriptionPlan.id
            .toLowerCase()
            .endsWith("standard") || false
        );
      }
    }
  }, [company?.id]);
  const menuItems = roleDisplayMenuItem(loggedInUserDetail);

  function isSelected(item: MainMenuItemType) {
    return (
      !selectedLink.includes("official") &&
      selectedLink.toLowerCase().includes(item.name.toLowerCase())
    );
  }

  return (
    <>
      {menuItems.map((item) => {
        if (item.children) {
          const itemMatchesPath = matchPath(location.pathname, {
            path: item.path,
            exact: false,
          });
          return (
            <SubMenu
              key={item.name}
              items={item.children
                .filter((it) => it.visible !== false)
                .map((ch) => ({
                  ...ch,
                  key: ch.name,
                }))}
              rootTitle={item.title}
              selected={!!itemMatchesPath}
            />
          );
        }
        return (
          <Menu.Item
            as="span"
            className={`
              item menuItem 
              ${isSelected(item) ? "selected" : ""} 
              ${selectedLink} 
            `}
            key={item.name}
          >
            <MenuItemWrapperMemoized
              item={item}
              counter={newMessagesCounter}
              setSelectedLink={setSelectedLink}
              userId={user?.id ?? ""}
              isLocked={
                isStandardBillRecord &&
                item.name.toLowerCase() === "automations"
              }
            />
          </Menu.Item>
        );
      })}
    </>
  );
};

const MenuItemWrapper = (props: {
  item: MenuItemType;
  counter?: number;
  setSelectedLink: (value: string) => void;
  userId: string;
  isLocked: boolean;
}) => {
  const { counter, isLocked, item, setSelectedLink, userId } = props;
  const handleLinkClick = useCallback(
    (e: React.MouseEvent, value: string) => {
      e.stopPropagation();
      setSelectedLink(value);
    },
    [setSelectedLink]
  );

  if (item.external) {
    return (
      <a href={item.url} rel="noopener noreferrer" target="_blank">
        {item.title}
      </a>
    );
  }

  return item.name.toLowerCase() === "inbox" ? (
    <InboxMenuItem
      handleLinkClick={handleLinkClick}
      item={item}
      isLocked={isLocked}
      userId={userId}
      counter={counter ?? 0}
    />
  ) : (
    <BaseMenuItem
      handleLinkClick={handleLinkClick}
      item={item}
      isLocked={isLocked}
    />
  );
};

const MenuItemWrapperMemoized = React.memo(MenuItemWrapper, equals);

export default MenuLeftLoggedIn;
