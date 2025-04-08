import { useFeaturesGuard } from "component/Settings/hooks/useFeaturesGuard";
import React, { ReactNode, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../../config/useRouteConfig";
import { StaffType } from "../../../../types/StaffType";
import SalesForceLogo from "../../../../features/Salesforce/assets/salesforce-logo.svg";
import useFetchCompany from "../../../../api/Company/useFetchCompany";
import { usePermission } from "component/shared/usePermission";
import { PERMISSION_KEY } from "types/Rbac/permission";
import { useAppSelector } from "AppRootContext";

export interface MenuItemType {
  name: string;
  path: string;
  title: string;
  icon?: ReactNode;
  isContactDropdown?: boolean;
}

export interface MainMenuItemType {
  name: string;
  path?: string;
  title: string;
  icon?: ReactNode;
  visible?: boolean;
  children?: MainMenuItemType[];
  beta?: boolean;
  rbac?: boolean;
}

export interface MainMenuNavItemType extends MainMenuItemType {
  path: string;
}

export function useMainMenus() {
  const { t, i18n } = useTranslation();
  const { routeTo } = useRouteConfig();
  const featureGuard = useFeaturesGuard();
  const { company } = useFetchCompany();
  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const { check } = usePermission();

  const isBlastCampaignEnabled =
    company?.blastMessageConfig?.isEnabled ?? false;

  const campaignsSubMenu = useMemo(
    () => [
      {
        name: "Campaigns",
        path: routeTo(`/campaigns`),
        title: t("nav.menu.campaigns"),
      },
      {
        name: "BlastCampaigns",
        path: routeTo(`/campaigns/blast`),
        title: t("nav.menu.blastCampaigns"),
      },
    ],
    [routeTo, t]
  );

  const fullMenuItems: MainMenuItemType[] = useMemo(
    () => [
      {
        name: "Inbox",
        path: routeTo(`/inbox`),
        title: t("nav.menu.inbox"),
      },
      {
        name: "Contacts",
        title: t("nav.menu.contacts"),
        path: routeTo(`/contacts`),
        children: [
          {
            name: "Contacts",
            path: routeTo(`/contacts`),
            title: t("nav.menu.contacts"),
          },
          {
            name: "Lists",
            path: routeTo(`/contacts/lists`),
            title: t("nav.menu.lists"),
          },
          {
            name: "Salesforce",
            title: "Salesforce",
            icon: <img src={SalesForceLogo} />,
            children: [
              {
                name: "Salesforce/Leads",
                path: routeTo(`/contacts/salesforce/leads`),
                title: t("nav.menu.leads"),
              },
              {
                name: "Salesforce/Opportunities",
                path: routeTo(`/contacts/salesforce/opportunities`),
                title: t("nav.menu.opportunities"),
              },
              {
                name: "Salesforce/Campaigns",
                path: routeTo(`/contacts/salesforce/campaigns`),
                title: t("nav.menu.сampaigns"),
              },
            ],
          },
        ],
      },
      {
        name: "Campaigns",
        path: routeTo(`/campaigns`),
        title: t("nav.menu.campaigns"),
        children: isBlastCampaignEnabled ? campaignsSubMenu : undefined,
      },
      {
        name: "Automation",
        path: routeTo(`/automations`),
        title: t("nav.menu.automations"),
      },
      {
        name: "Analytics",
        path: routeTo(`/analytics`),
        title: t("nav.menu.analytics"),
        visible: check([
          PERMISSION_KEY.analyticsConversationView,
          PERMISSION_KEY.analyticsSalesView,
        ]).some(Boolean),
        children: [
          {
            name: "Analytics/Conversations",
            path: routeTo(`/analytics/conversations`),
            title: t("nav.menu.conversations"),
            visible: check([PERMISSION_KEY.analyticsConversationView])[0],
          },
          {
            name: "Analytics/Sales",
            path: routeTo(`/analytics/sales`),
            title: t("nav.menu.sales"),
            visible: check([PERMISSION_KEY.analyticsSalesView])[0],
          },
        ],
      },
      {
        name: "Channels",
        path: routeTo(`/channels`),
        title: t("nav.menu.channels"),
        visible: check([PERMISSION_KEY.channelView])[0],
      },
    ],
    [t, check, routeTo, campaignsSubMenu, isBlastCampaignEnabled]
  );

  function matchItems(names: string[]) {
    return (item: MainMenuItemType) => names.includes(item.name);
  }

  const roleMenuMapping = useMemo(
    () => ({
      staff: fullMenuItems.filter(matchItems(["Inbox", "Contacts"])),
      teamadmin: fullMenuItems.filter(
        matchItems(["Inbox", "Contacts", "Campaigns"])
      ),
      admin: fullMenuItems,
      demoadmin: fullMenuItems,
    }),
    [fullMenuItems]
  );

  const getVisibleItems = useCallback(
    (loggedInUserDetail: StaffType | undefined): MainMenuItemType[] => {
      if (!loggedInUserDetail) {
        return roleMenuMapping.admin;
      }

      const roleSpecificMenuItems = isRbacEnabled
        ? fullMenuItems
        : roleMenuMapping[
            loggedInUserDetail.roleType.toLowerCase() as keyof typeof roleMenuMapping
          ] ?? roleMenuMapping.admin;

      return roleSpecificMenuItems
        .map((item) =>
          item.children
            ? {
                ...item,
                children: item.children.filter((child) =>
                  "visible" in child ? item.visible : true
                ),
              }
            : item
        )
        .filter((item) => ("visible" in item ? item.visible : true));
    },
    [fullMenuItems, isRbacEnabled, roleMenuMapping]
  );

  return {
    roleDisplayMenuItem: getVisibleItems,
  };
}
