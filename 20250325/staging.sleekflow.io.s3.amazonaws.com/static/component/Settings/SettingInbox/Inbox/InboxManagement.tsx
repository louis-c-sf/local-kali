import React, { useCallback, useEffect, useMemo, useState } from "react";
import { equals } from "ramda";
import {
  Button,
  Checkbox,
  Dimmer,
  Divider,
  Header,
  Label,
  Loader,
  Menu,
  Tab,
} from "semantic-ui-react";
import { TabProps } from "semantic-ui-react/dist/commonjs/modules/Tab/Tab";
import BannerMessage from "../../../BannerMessage/BannerMessage";
import { useFlashMessageChannel } from "../../../BannerMessage/flashBannerMessage";
import { Trans, useTranslation } from "react-i18next";
import { post } from "../../../../api/apiRequest";
import {
  POST_COMPANY_SORT_MESSAGE,
  POST_USER_ROLE_PERMISSION,
} from "../../../../api/apiPath";
import fetchUserRolePermission from "../../../../api/Company/fetchUserRolePermission";
import { useAccessRulesGuard } from "../../hooks/useAccessRulesGuard";
import { useFeaturesGuard } from "../../hooks/useFeaturesGuard";
import {
  PermissionType,
  UserRolePermissionRequestType,
  UserRolePermissionResponseType,
} from "../../../../types/PermissionType";
import ChannelsTooltip from "./ChannelsTooltip";
import LinkWithIcon from "./LinkWithIcon";
import PromoAddOn from "./PromoAddOn";
import LevelUpChannelsSettings from "./LevelUpChannelsSettings";
import SortCheckboxGroup from "./SortCheckboxGroup";
import styles from "./InboxManagement.module.css";
import { useAppDispatch, useAppSelector } from "AppRootContext";
import {
  DefaultOrderBy,
  InboxOrderDictEnum,
} from "../../../../types/state/InboxStateType";
import { fetchCompany } from "api/Company/fetchCompany";
import { RbacCheckboxGroup } from "./RbacCheckboxGroup";
import { useCompanyPolicies } from "./CompanyPoliciesContext";
import { useBulkUpdatePermission } from "api/Setting/useBulkUpdatePermission";
import { useRequireRBAC } from "component/shared/useRequireRBAC";
import { PERMISSION_KEY } from "types/Rbac/permission";

interface RolePermissionMapType {
  admin: PermissionType;
  teamAdmin: PermissionType;
  staff: PermissionType;
}

interface RoleCheckboxGroupPropsType {
  permission: keyof PermissionType;
  disabled?: boolean;
}

interface TextContentPropsType {
  title?: string | React.ReactElement;
  subTitle?: string | React.ReactElement;
  description?: string | React.ReactElement;
}

interface RoleCheckboxDataType extends TabProps {
  role: keyof RolePermissionMapType;
  permission: keyof PermissionType;
}

const toCamelCase = (value: string): string => {
  if (!value) {
    return value;
  }
  return value.replace(value[0], value[0].toLowerCase());
};

const toPascalCase = (value: string): string => {
  if (!value) {
    return value;
  }
  return value.replace(value[0], value[0].toUpperCase());
};

const initRolePermissionMap: RolePermissionMapType = {
  admin: {
    isShowDefaultChannelMessagesOnly: true,
    receiveUnassignedNotifications: true,
    isMaskPhoneNumber: false,
    isMaskEmail: false,
    addAsCollaboratorWhenReply: false,
    addAsCollaboratorWhenAssignedToOthers: false,
    filterMessageWithSelectedChannel: false,
  },
  teamAdmin: {
    isShowDefaultChannelMessagesOnly: true,
    receiveUnassignedNotifications: true,
    isMaskPhoneNumber: false,
    isMaskEmail: false,
    addAsCollaboratorWhenReply: false,
    addAsCollaboratorWhenAssignedToOthers: false,
    filterMessageWithSelectedChannel: false,
  },
  staff: {
    isShowDefaultChannelMessagesOnly: true,
    receiveUnassignedNotifications: true,
    isMaskPhoneNumber: false,
    isMaskEmail: false,
    addAsCollaboratorWhenReply: false,
    addAsCollaboratorWhenAssignedToOthers: false,
    filterMessageWithSelectedChannel: false,
  },
};

let currentRolePermissionMap: null | RolePermissionMapType = null;

export default function InboxManagement() {
  useRequireRBAC([PERMISSION_KEY.inboxSettingsManage]);

  const isRbacEnabled = useAppSelector((s) => s.isRbacEnabled);
  const companyPolicies = useCompanyPolicies();
  const bulkUpdatePermission = useBulkUpdatePermission();
  const loginDispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [rolePermissionMap, setRolePermissionMap] =
    useState<RolePermissionMapType>(initRolePermissionMap);
  const { t } = useTranslation();
  const accessRulesGuard = useAccessRulesGuard();
  const featureGuard = useFeaturesGuard();
  const isAdmin = isRbacEnabled ? true : accessRulesGuard.isAdmin();
  const canUseMaskedContactSetting = featureGuard.canUseMaskedContactSetting();
  const canUseChannelsSetting = featureGuard.canUseChannelsSetting();
  const flash = useFlashMessageChannel();
  const defaultInboxOrder = useAppSelector(
    (s) => s.company?.defaultInboxOrder ?? DefaultOrderBy
  );
  const [selectedSort, setSelectedSort] =
    useState<InboxOrderDictEnum>(defaultInboxOrder);

  const roleNamesMap = {
    admin: t("system.user.role.admin.name"),
    staff: t("system.user.role.staff.name"),
    teamAdmin: t("system.user.role.teamAdmin.name"),
  };
  const flashMessageMap = {
    common: {
      connectOperator: t("flash.settings.inbox.common.connectOperator"),
      lastOperator: t("flash.settings.inbox.common.lastOperator"),
    },
    channels: t("flash.settings.inbox.channels"),
    notifications: t("flash.settings.inbox.notifications"),
    contacts: t("flash.settings.inbox.contacts"),
    collaborator: t("flash.settings.inbox.collaborator"),
    filters: t("flash.settings.inbox.filters"),
    sort: t("flash.settings.inbox.sort"),
  };
  const nonEqualKeyMappingWithTab = {
    receiveUnassignedNotifications: flashMessageMap.notifications,
    addAsCollaboratorWhenReply: flashMessageMap.collaborator,
    addAsCollaboratorWhenAssignedToOthers: flashMessageMap.collaborator,
    isMaskPhoneNumber: flashMessageMap.contacts,
    isMaskEmail: flashMessageMap.contacts,
    isShowDefaultChannelMessagesOnly: flashMessageMap.channels,
    sort: flashMessageMap.sort,
  };

  const handleCheckboxChange = (data: RoleCheckboxDataType) => {
    const { checked, role, permission } = data;
    const nextPermissionByRole = {
      ...rolePermissionMap[role],
      [permission]: checked,
    };
    setRolePermissionMap((prevState) => ({
      ...prevState,
      [role]: nextPermissionByRole,
    }));
  };

  const isDirty = useMemo(
    () =>
      companyPolicies.isDirty ||
      (currentRolePermissionMap
        ? !equals(currentRolePermissionMap, rolePermissionMap)
        : false),
    [companyPolicies.isDirty, rolePermissionMap]
  );

  const isSortDirty = defaultInboxOrder
    ? selectedSort !== defaultInboxOrder
    : false;

  const getDirtyTabItems = () => {
    if (!currentRolePermissionMap) {
      return [];
    }
    let dirtyKeys: string[] = [];
    const roles = Object.keys(roleNamesMap);
    roles.forEach((roleKey: string) => {
      const nonEqualKeys = Object.entries(
        (currentRolePermissionMap ?? {})[roleKey]
      ).reduce((acc: string[], [key, currentRoleValue]) => {
        if (rolePermissionMap[roleKey][key] !== currentRoleValue) {
          acc.push(key);
        }
        return acc;
      }, []);
      dirtyKeys = [...new Set([...dirtyKeys, ...nonEqualKeys])];
    });
    if (isSortDirty) {
      dirtyKeys.push("sort");
    }
    const dirtyItems = [
      ...new Set(dirtyKeys.map((key) => nonEqualKeyMappingWithTab[key])),
    ];
    return dirtyItems;
  };

  const getFlashMessage = () => {
    const dirtyItems: string[] = getDirtyTabItems();
    let msg = "";
    if (dirtyItems.length > 1) {
      const lastItem = dirtyItems[dirtyItems.length - 1];
      const items = dirtyItems
        .filter((item) => item !== lastItem)
        .join(flashMessageMap.common.connectOperator);
      const lastOperator = flashMessageMap.common.lastOperator;
      msg = t("flash.settings.inbox.common.plural", {
        items,
        lastOperator,
        lastItem,
      });
    } else {
      msg = t("flash.settings.inbox.common.single", { item: dirtyItems[0] });
    }
    return msg;
  };

  const saveRolePermission = async () => {
    try {
      setLoading(true);
      if (isDirty) {
        if (isRbacEnabled) {
          await bulkUpdatePermission.bulkUpdateCompanyPolicies(
            companyPolicies.toggledRoles
          );
        } else {
          const param = Object.keys(rolePermissionMap).reduce((acc, role) => {
            acc.push({
              staffUserRole: toPascalCase(role),
              storedPermission: rolePermissionMap[role],
            });
            return acc;
          }, [] as UserRolePermissionRequestType[]);
          await post(POST_USER_ROLE_PERMISSION, { param });
        }
      }
      if (isSortDirty) {
        await post(POST_COMPANY_SORT_MESSAGE.replace("{order}", selectedSort), {
          param: {},
        });
      }
      flash(getFlashMessage());
    } catch (error) {
      console.error(error);
      flash(t("flash.common.unknownErrorTryLater"));
    } finally {
      if (isDirty) {
        updateUserRolePermission();
      }
      if (isSortDirty) {
        refetchCompany();
      }
      setLoading(false);
    }
  };

  const RoleCheckboxGroup = (
    props: RoleCheckboxGroupPropsType
  ): React.ReactElement => {
    const { permission, disabled } = props;
    return (
      <div className={styles.checkboxGroup}>
        {Object.keys(rolePermissionMap).map((role) => (
          <Checkbox
            key={`${role}-${permission}`}
            label={roleNamesMap[role]}
            disabled={!isAdmin || disabled}
            checked={rolePermissionMap[role][permission]}
            onChange={(_, data) =>
              handleCheckboxChange({
                ...data,
                role,
                permission,
              } as RoleCheckboxDataType)
            }
          />
        ))}
      </div>
    );
  };

  const TextContent = (props: TextContentPropsType): React.ReactElement => {
    const { title, subTitle, description } = props;
    return (
      <>
        {title && <div className={styles.title}>{title}</div>}
        {subTitle && <div className={styles.subTitle}>{subTitle}</div>}
        {description && <div className={styles.description}>{description}</div>}
      </>
    );
  };

  const updateUserRolePermission = useCallback(() => {
    fetchUserRolePermission()
      .then((res: UserRolePermissionResponseType[]) => {
        if (res.length === 0) {
          return;
        }
        let nextRolePermissionMap = {} as RolePermissionMapType;
        for (let i = 0; i < res.length; i++) {
          const key = toCamelCase(res[i].staffUserRole);
          if (key === "demoAdmin") {
            continue;
          }
          const value = res[i].permission;
          nextRolePermissionMap[key] = value;
        }
        setRolePermissionMap(nextRolePermissionMap);
        currentRolePermissionMap = nextRolePermissionMap;
      })
      .catch((e) => {
        console.error(`fetchUserRolePermission error ${e}`);
      })
      .finally(() => {
        setItemsLoading(false);
      });
  }, []);

  const refetchCompany = async () => {
    try {
      const companyUpdated = await fetchCompany();
      loginDispatch({ type: "UPDATE_COMPANY_INFO", company: companyUpdated });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!isRbacEnabled) {
      updateUserRolePermission();
    }
  }, [isRbacEnabled, updateUserRolePermission]);

  let panes = [
    {
      menuItem: t("settings.inbox.notifications.title"),
      key: "notifications",
      render: () => (
        <Tab.Pane>
          <TextContent
            title={t(
              "settings.inbox.notifications.unassignedConversations.title"
            )}
            description={t(
              "settings.inbox.notifications.unassignedConversations.description"
            )}
          />
          {isRbacEnabled ? (
            <RbacCheckboxGroup policy="view_conversations:unassigned_conversations_notifications" />
          ) : (
            <RoleCheckboxGroup permission="receiveUnassignedNotifications" />
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("settings.inbox.collaborator.title"),
      key: "collaborator",
      render: () => (
        <Tab.Pane>
          <TextContent
            title={t("settings.inbox.collaborator.title")}
            subTitle={t("settings.inbox.collaborator.becomeCollaborator.title")}
            description={t(
              "settings.inbox.collaborator.becomeCollaborator.description"
            )}
          />
          {isRbacEnabled ? (
            <RbacCheckboxGroup policy="send_message:become_collaborator_when_reply" />
          ) : (
            <RoleCheckboxGroup permission="addAsCollaboratorWhenReply" />
          )}
          <Divider />
          <TextContent
            subTitle={t(
              "settings.inbox.collaborator.remainAsCollaborator.title"
            )}
            description={t(
              "settings.inbox.collaborator.remainAsCollaborator.description"
            )}
          />
          {isRbacEnabled ? (
            <RbacCheckboxGroup policy="assign_conversations:remain_collaborator_when_reassigned" />
          ) : (
            <RoleCheckboxGroup permission="addAsCollaboratorWhenAssignedToOthers" />
          )}
        </Tab.Pane>
      ),
    },
    // {
    //   menuItem: t("settings.inbox.filters.title"),
    //   key: "filters",
    //   render: () => (
    //     <Tab.Pane>
    //       <TextContent
    //         title={t("settings.inbox.filters.filterMessagesByChannel.title")}
    //         description={t("settings.inbox.filters.filterMessagesByChannel.description")}
    //       />
    //       <RoleCheckboxGroup permission="filterMessageWithSelectedChannel" />
    //     </Tab.Pane>
    //   ),
    // },
    {
      menuItem: t("settings.inbox.contacts.title"),
      key: "contacts",
      render: () => (
        <Tab.Pane>
          {!canUseMaskedContactSetting && <PromoAddOn />}
          <TextContent
            title={t("settings.inbox.contacts.maskedContact")}
            subTitle={t("settings.inbox.contacts.phoneNumber.title")}
            description={t("settings.inbox.contacts.phoneNumber.description")}
          />
          <RoleCheckboxGroup
            permission="isMaskPhoneNumber"
            disabled={!canUseMaskedContactSetting}
          />
          <Divider />
          <TextContent
            subTitle={t("settings.inbox.contacts.emailAddress.title")}
            description={t("settings.inbox.contacts.emailAddress.description")}
          />
          <RoleCheckboxGroup
            permission="isMaskEmail"
            disabled={!canUseMaskedContactSetting}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: (
        <Menu.Item key="channels">
          {t("settings.inbox.channels.title")}
          <Label>{t("settings.inbox.channels.label.premium")}</Label>
        </Menu.Item>
      ),
      key: "channels",
      render: () => (
        <Tab.Pane>
          {canUseChannelsSetting ? (
            <>
              <TextContent
                title={
                  <>
                    {t(
                      "settings.inbox.channels.viewMessagesFromDefaultChannelsOnly.title"
                    )}
                    <ChannelsTooltip />
                  </>
                }
                description={
                  <Trans
                    i18nKey={
                      "settings.inbox.channels.viewMessagesFromDefaultChannelsOnly.description"
                    }
                  >
                    Manage which role(s) can view and send messages from default
                    channels only. For default channels setting, go to
                    <LinkWithIcon />
                  </Trans>
                }
              />
              {isRbacEnabled ? (
                <RbacCheckboxGroup policy="view_conversations:view_default_channels_messages_only" />
              ) : (
                <RoleCheckboxGroup permission="isShowDefaultChannelMessagesOnly" />
              )}
            </>
          ) : (
            <LevelUpChannelsSettings />
          )}
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("settings.inbox.sort.title"),
      key: "sort",
      render: () => (
        <Tab.Pane>
          <TextContent title={t("settings.inbox.sort.content.title")} />
          <SortCheckboxGroup sort={selectedSort} setSort={setSelectedSort} />
        </Tab.Pane>
      ),
    },
  ];

  // Only open Contacts Tab if the user account pays for masked contact add-on
  if (!canUseMaskedContactSetting) {
    panes = panes.filter((p) => p.key !== "contacts");
  }

  const isLoading = isRbacEnabled ? companyPolicies.isLoading : itemsLoading;

  return (
    <Dimmer.Dimmable dimmed className={`content`}>
      {isLoading ? (
        <Dimmer active inverted>
          <Loader inverted />
        </Dimmer>
      ) : (
        <>
          <div className={`container ${styles.container}`}>
            <div className={`header ${styles.header}`}>
              <Header>{t("settings.inbox.title")}</Header>
              <div className="action-btn">
                <Button
                  className="button1"
                  loading={loading}
                  onClick={saveRolePermission}
                  disabled={!isAdmin || (!isDirty && !isSortDirty)}
                  content={t("settings.inbox.button")}
                />
              </div>
            </div>
            <Divider />
            <div className={styles.contentInfo}>
              <Tab
                menu={{ secondary: true, pointing: true }}
                panes={panes}
                renderActiveOnly
              />
            </div>
          </div>
          <BannerMessage />
        </>
      )}
    </Dimmer.Dimmable>
  );
}
