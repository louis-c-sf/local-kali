import React, { ReactNode, useEffect, useState } from "react";
import { Menu, Table } from "semantic-ui-react";
import GridHeader from "../shared/grid/GridHeader";
import {
  deleteMethod,
  isApiError,
  parseHttpError,
  post,
  postWithExceptions,
} from "../../api/apiRequest";
import {
  DELETE_ASSIGNMENT_RULE,
  POST_ASSIGNMENT_RULE_REORDER,
  POST_DUPLICATE_AUTOMATION_RULE,
  UPDATE_ASSIGNMENT_RULE,
} from "../../api/apiPath";
import { Link } from "react-router-dom";
import { AutomationRuleRow } from "./AutomationRuleRow";
import { catchLinkClicked } from "../../utility/dom";
import { isDefaultAssignmentRule } from "./filters";
import { useFlashMessageChannel } from "../BannerMessage/flashBannerMessage";
import GridDummy from "../shared/Placeholder/GridDummy";
import AssignmentResponseType, {
  AssignmentRuleType,
  AutomationTypeEnum,
} from "../../types/AssignmentRuleType";
import { swapOrderables } from "./helpers/swapOrderables";
import SandboxTableBodyContent from "../SandboxTableBodyContent";
import { isFreePlan } from "../../types/PlanSelectionType";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import useRouteConfig from "../../config/useRouteConfig";
import { GridSelection } from "../shared/grid/GridSelection";
import { buildAutomationRequest } from "./AutomationRuleEdit/buildAutomationRequest";
import { AutomationRuleGuard } from "./AutomationRuleEdit/AutomationRuleGuard";
import { equals, pick, update } from "ramda";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { withActionsDenormalized } from "./AutomationRuleEdit/denormalizeAutomationRule";
import { useFeaturesGuard } from "../Settings/hooks/useFeaturesGuard";
import useFetchAutomationRules from "../../api/Company/useFetchAutomationRules";
import { AutomationTableHeader } from "./AutomationTableHeader";
import { MenuItemProps } from "semantic-ui-react/dist/commonjs/collections/Menu/MenuItem";
import { useLocation } from "react-router";
import { EmptyListSplash } from "./AutomationTable/EmptyListSplash";
import Helmet from "react-helmet";
import { useConditionFieldBuilder } from "./AutomationRuleEdit/useConditionFieldBuilder";
import styles from "./AutomationTable.module.css";
import { ReactSortable } from "react-sortablejs";
import { noop } from "lib/utility/noop";
import mixpanel from "mixpanel-browser";

export default AutomationTable;

function getRuleFilter(triggerType: SelectTriggerType) {
  return triggerType === "Default"
    ? isDefaultAssignmentRule
    : (r: AssignmentRuleType) =>
        r.automationType === triggerType && !isDefaultAssignmentRule(r);
}

function isWritable(rule: AssignmentRuleType) {
  return !isDefaultAssignmentRule(rule) && rule.id !== undefined;
}

export function filterLiveAssignmentRule(rule: AssignmentRuleType) {
  return !isDefaultAssignmentRule(rule) && rule.status === "Live";
}

export function isAbleToCreateAutomation(
  automationRules: AssignmentRuleType[],
  companyMaximumAutomation: number
) {
  if (automationRules.length && companyMaximumAutomation) {
    return (
      automationRules.filter(
        (rule) => !isDefaultAssignmentRule(rule) && rule.status === "Live"
      ).length < companyMaximumAutomation
    );
  }
  return true;
}

export type SelectTriggerType = AutomationTypeEnum | "Default";

export type TriggerGroupType = "general" | "shopify" | "facebook" | "instagram";
type AutomationsLocationStateType = { selectTriggerType?: SelectTriggerType };

function AutomationTable() {
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>([]);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] =
    useState(false);
  const location = useLocation<AutomationsLocationStateType>();
  const [triggerGroupSelected, setTriggerGroupSelected] =
    useState<TriggerGroupType>();
  const [triggerTypeSelected, setTriggerTypeSelected] =
    useState<SelectTriggerType>(
      location.state?.selectTriggerType ?? "MessageReceived"
    );
  const [isFirstOpen, setIsFirstOpen] = useState(false);
  const isDisplayedDefaultRule = useAppSelector(
    (s) => s.isDisplayedDefaultRule
  );
  useEffect(() => {
    if (triggerGroupSelected !== undefined) {
      return;
    }
    let initGroup: TriggerGroupType | undefined;
    if (location.state?.selectTriggerType) {
      initGroup = getInitTriggerGroupSelected(location.state.selectTriggerType);
    }
    setTriggerGroupSelected(initGroup ?? "general");
  }, [triggerGroupSelected, location.state?.selectTriggerType]);

  const { currentPlan, company } = useAppSelector(
    pick(["currentPlan", "company"]),
    equals
  );
  const hideShopify = true;
  const hasFacebookConfig = company?.facebookConfigs ?? false;
  const hasInstagramConfig = company?.instagramConfigs ?? false;

  const loginDispatch = useAppDispatch();
  const {
    automationRules,
    updateAutomationRules,
    getLiveData,
    denormalizeRule,
    automationRulesLoading,
    refreshAutomationRules,
    fetchAutomationRulesTemplates,
  } = useFetchAutomationRules();
  const { booted: builderBooted } = useConditionFieldBuilder();
  const [pending, setPending] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const defaultRule = automationRules?.find(isDefaultAssignmentRule);
  const automationRulesVisible =
    automationRules?.filter(getRuleFilter(triggerTypeSelected)) ?? [];
  // these records could be reordered / deleted
  const writableRules = automationRulesVisible.filter(isWritable) ?? [];
  const { routeTo } = useRouteConfig();
  const defaultRuleId: string | undefined = defaultRule?.id;
  const { t } = useTranslation();
  const flash = useFlashMessageChannel();
  const featureGuard = useFeaturesGuard();
  useEffect(() => {
    if (!builderBooted) {
      return;
    }
    if (pending) {
      return;
    }
    if (isFreePlan(currentPlan)) {
      updateAutomationRules([]);
    } else {
      if (automationRulesLoading) {
        setPending(true);
        refreshAutomationRules()
          .then(() => {
            setPending(false);
          })
          .catch((e) => {
            console.error(e);
          });
      }
    }
  }, [pending, automationRulesLoading, builderBooted, currentPlan.id]);
  const triggerTabItemsGeneral: Array<MenuItemProps> = [
    {
      text: t("automation.rule.type.name.MessageReceived"),
      content: (
        <TabItem type={"MessageReceived"} rules={automationRules}>
          {t("automation.rule.type.name.MessageReceived")}
        </TabItem>
      ),
      name: "MessageReceived",
    },
    {
      text: t("automation.rule.type.name.OutgoingMessageTrigger"),
      content: (
        <TabItem type={"OutgoingMessageTrigger"} rules={automationRules}>
          {t("automation.rule.type.name.OutgoingMessageTrigger")}
        </TabItem>
      ),
      name: "OutgoingMessageTrigger",
    },
    {
      text: t("automation.rule.type.name.NewContactMessage"),
      content: (
        <TabItem type={"NewContactMessage"} rules={automationRules}>
          {t("automation.rule.type.name.NewContactMessage")}
        </TabItem>
      ),
      name: "NewContactMessage",
    },
    {
      text: t("automation.rule.type.name.ContactAdded"),
      content: (
        <TabItem type={"ContactAdded"} rules={automationRules}>
          {t("automation.rule.type.name.ContactAdded")}
        </TabItem>
      ),
      name: "ContactAdded",
    },
    {
      text: t("automation.rule.type.name.FieldValueChanged"),
      content: (
        <TabItem type={"FieldValueChanged"} rules={automationRules}>
          {t("automation.rule.type.name.FieldValueChanged")}
        </TabItem>
      ),
      name: "FieldValueChanged",
    },
    {
      text: t("automation.rule.type.name.RecurringJob"),
      content: (
        <TabItem type={"RecurringJob"} rules={automationRules}>
          {t("automation.rule.type.name.RecurringJob")}
        </TabItem>
      ),
      name: "RecurringJob",
    },
    {
      text: t("automation.rule.default.short"),
      content: (
        <>
          {t("automation.rule.default.short")}
          {isFirstOpen && <span className={"update-marker"} />}
        </>
      ),
      name: "Default",
    },
  ];
  useEffect(() => {
    if (!isDisplayedDefaultRule) {
      // this would reset on first unmount
      // and never restore once the guide is displayed
      setIsFirstOpen(true);
    }
  }, [isDisplayedDefaultRule]);
  const triggerTabItemsShopify: Array<MenuItemProps> = [
    {
      content: (
        <TabItem
          type={"ShopifyNewOrUpdatedOrderTrigger"}
          rules={automationRules}
        >
          {t("automation.rule.type.name.ShopifyNewOrUpdatedOrderTrigger")}
        </TabItem>
      ),
      name: "ShopifyNewOrUpdatedOrderTrigger",
    },
    {
      text: t("automation.rule.type.name.ShopifyNewAbandonedCart"),
      content: (
        <TabItem type={"ShopifyNewAbandonedCart"} rules={automationRules}>
          {t("automation.rule.type.name.ShopifyNewAbandonedCart")}
        </TabItem>
      ),
      name: "ShopifyNewAbandonedCart",
    },
    {
      text: t("automation.rule.type.name.ShopifyNewCustomerTrigger"),
      content: (
        <TabItem type={"ShopifyNewCustomerTrigger"} rules={automationRules}>
          {t("automation.rule.type.name.ShopifyNewCustomerTrigger")}
        </TabItem>
      ),
      name: "ShopifyNewCustomerTrigger",
    },
    {
      text: t("automation.rule.type.name.ShopifyFulfillmentStatusTrigger"),
      content: (
        <TabItem
          type={"ShopifyFulfillmentStatusTrigger"}
          rules={automationRules}
        >
          {t("automation.rule.type.name.ShopifyFulfillmentStatusTrigger")}
        </TabItem>
      ),
      name: "ShopifyFulfillmentStatusTrigger",
    },
  ];

  const triggerTabItemsFacebook: Array<MenuItemProps> = [
    {
      content: (
        <TabItem type={"FacebookPostComment"} rules={automationRules}>
          {t("automation.rule.type.name.FacebookPostComment").replace(
            "Facebook",
            ""
          )}
        </TabItem>
      ),
      name: "FacebookPostComment",
    },
  ];
  const triggerTabItemsInstagram: Array<MenuItemProps> = [
    {
      content: (
        <TabItem type={"InstagramMediaComment"} rules={automationRules}>
          {t("automation.rule.type.name.InstagramPostComment").replace(
            "Instagram",
            ""
          )}
        </TabItem>
      ),
      name: "InstagramMediaComment",
    },
  ];

  const triggerGroups: Record<TriggerGroupType, Array<MenuItemProps>> = {
    general: triggerTabItemsGeneral,
    shopify: triggerTabItemsShopify,
    facebook: triggerTabItemsFacebook,
    instagram: triggerTabItemsInstagram,
  } as const;

  function getInitTriggerGroupSelected(
    initSubType: SelectTriggerType
  ): TriggerGroupType | undefined {
    const groupName = Object.keys(triggerGroups).find((g) => {
      const triggerItems = triggerGroups[g] as MenuItemProps[];
      return triggerItems.some((t) => t.name === initSubType);
    });
    return groupName as TriggerGroupType;
  }

  function getSelectedTriggerGroupItems() {
    if (triggerGroupSelected) {
      return triggerGroups[triggerGroupSelected] ?? [];
    }
    return [];
  }

  function getSelectedTabItem() {
    const group = getSelectedTriggerGroupItems();
    return group.find((i) => i.name === triggerTypeSelected);
  }

  const triggerGroupMenuItems: MenuItemProps[] = [
    {
      content: t("automation.rule.group.type.name.general"),
      name: "general",
    },
  ];
  if (!hideShopify) {
    triggerGroupMenuItems.push({
      content: t("automation.rule.group.type.name.shopify"),
      name: "shopify",
    });
  }
  if (hasFacebookConfig) {
    triggerGroupMenuItems.push({
      content: t("automation.rule.group.type.name.facebook"),
      name: "facebook",
    });
  }
  if (hasInstagramConfig) {
    triggerGroupMenuItems.push({
      content: t("automation.rule.group.type.name.instagram"),
      name: "instagram",
    });
  }

  const selectAll = () => {
    const allRuleIds = writableRules.map((rule) => rule.id);
    if (allRuleIds.length === selectedRuleIds.length) {
      setSelectedRuleIds([]);
    } else {
      setSelectedRuleIds([...(allRuleIds as string[])]);
    }
  };

  function handleCellSelected(e: React.MouseEvent, id: string) {
    if (catchLinkClicked(e)) {
      return;
    }
    const selectedIds = [...selectedRuleIds];

    e.stopPropagation();
    e.preventDefault();
    const foundIndex = selectedIds.indexOf(id);
    let selectionExtended: string[];

    if (foundIndex === -1) {
      selectionExtended = [...selectedIds, id];
    } else {
      selectedIds.splice(foundIndex, 1);
      selectionExtended = [...selectedIds];
    }
    setSelectedRuleIds(
      selectionExtended.filter((idSelected) => idSelected !== defaultRuleId)
    );
  }

  async function removeItem() {
    if (automationRules === undefined) {
      return;
    }

    const deleteIdList = [...selectedRuleIds].filter(
      (selectedId) => selectedId !== defaultRuleId
    );

    try {
      setDeleteLoading(true);
      await deleteMethod(DELETE_ASSIGNMENT_RULE, {
        param: { assignmentRuleIds: deleteIdList },
      });
      updateAutomationRules(
        automationRules.filter(
          (rule) => !deleteIdList.includes(String(rule.id))
        )
      );
      setSelectedRuleIds([]);
      flash(t("flash.automation.deleted", { count: deleteIdList.length }));
    } catch (e) {
      console.error(`Cannot delete rules: ${deleteIdList.join(",")}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  function replaceItem(id: string, item: AssignmentRuleType) {
    if (!automationRules) {
      return;
    }
    const itemExistedIndex = automationRules.findIndex((r) => r.id === id);
    updateAutomationRules(update(itemExistedIndex, item, automationRules));
  }

  async function reorderCompleteHandler(
    from: number | undefined,
    to: number | undefined
  ) {
    if (from === undefined || to === undefined) {
      return;
    }
    if (automationRules === undefined) {
      return;
    }

    const indexFrom = from;
    const indexTo = to;
    // no need to save the same position
    if (indexFrom === indexTo) {
      return;
    }
    const ruleFrom = automationRulesVisible[indexFrom];
    const ruleTo = automationRulesVisible[indexTo];

    const realIndexFrom = automationRules.findIndex(
      (r) => r.id === ruleFrom.id
    );
    const realIndexTo = automationRules.findIndex((r) => r.id === ruleTo.id);

    const newRules = swapOrderables(
      automationRules,
      realIndexFrom,
      realIndexTo
    );

    try {
      if (!isFreePlan(currentPlan)) {
        if (defaultRule) {
          updateAutomationRules(newRules.concat(defaultRule));
        } else {
          updateAutomationRules(newRules);
        }
        await reorderItems(newRules);
      }
    } catch (e) {
      // revert order
      updateAutomationRules(automationRules);
      console.error("reorder fail", e, { newRules, automationRules });
    }
  }

  async function reorderItems(rules: AssignmentRuleType[]) {
    const itemsReordered = rules.map((rule, i) => ({
      assignmentId: rule.id,
      order: i,
    }));

    try {
      await post(POST_ASSIGNMENT_RULE_REORDER, { param: itemsReordered });
    } catch (e) {
      console.error(`reorderItems`, e, {
        itemsReordered,
        rules,
      });
      throw e;
    }
  }

  async function submitDuplicateRule(rule: AssignmentRuleType) {
    try {
      const result: AssignmentResponseType[] = await postWithExceptions(
        POST_DUPLICATE_AUTOMATION_RULE.replace("{ruleId}", rule.id as string),
        { param: {} }
      );
      await fetchAutomationRulesTemplates(result);
      updateAutomationRules(result.map(denormalizeRule));
    } catch (e) {
      console.error("submitDuplicateRule", e, rule);
    }
  }

  async function submitToggleStatus(id: string, published: boolean) {
    const newStatus = published ? "Live" : "Draft";
    const itemToUpdate = automationRules?.find((r) => r.id === id);
    if (!itemToUpdate) {
      return;
    }
    try {
      const updatedItem: AssignmentRuleType = {
        ...withActionsDenormalized(itemToUpdate),
        status: newStatus,
      };
      const request = buildAutomationRequest(
        updatedItem,
        new AutomationRuleGuard(updatedItem),
        company
      );
      if (
        newStatus === "Live" &&
        !featureGuard.canCreateAutomation(getLiveData())
      ) {
        flash(t("flash.automation.maxRules"));
        return;
      }
      await postWithExceptions(UPDATE_ASSIGNMENT_RULE, {
        param: [{ ...request, assignmentId: id }],
      });
      if (published) {
        mixpanel.track("Automation Published");
      }
      flash(
        published
          ? t("flash.automation.enabled")
          : t("flash.automation.disabled")
      );
      replaceItem(id, updatedItem);
    } catch (e) {
      const errorParsed = parseHttpError(e);
      if (isApiError(errorParsed)) {
        if (errorParsed.errorId === "ERR_RULES_LIMIT_BY_PLAN") {
          flash(t("flash.automation.maxRules"));
        }
      }
      replaceItem(id, itemToUpdate);
    }
  }

  function switchTriggerGroupType(_: any, data: MenuItemProps) {
    const typeSelected = (data.name as TriggerGroupType) ?? "general";
    setTriggerGroupSelected(typeSelected);
    const [firstTriggerType] = triggerGroups[typeSelected];
    setTriggerTypeSelected(firstTriggerType.name as SelectTriggerType);
    setSelectedRuleIds([]);
  }

  function switchTriggerTypeFilter(_: any, data: MenuItemProps) {
    const typeSelected = (data.name as SelectTriggerType) ?? "Default";
    setTriggerTypeSelected(typeSelected);
    setSelectedRuleIds([]);
    if (typeSelected === "Default") {
      setIsFirstOpen(false);
      loginDispatch({
        type: "DISPLAY_AUTOMATION_DEFAULT_RULE",
      });
    }
  }

  const defaultTitle = t("automation.grid.header.counted");
  const titleTranslated = t("nav.common.title", {
    page: getSelectedTabItem()?.text ?? defaultTitle,
  });

  return (
    <>
      <Helmet title={titleTranslated} />
      <GridHeader
        split
        requestDeleteConfirmation={setDeleteConfirmationVisible}
        deleteConfirmationRequested={deleteConfirmationVisible}
        selectedItemsCount={selectedRuleIds.length}
        deleteLoading={deleteLoading}
        onDeleteClick={() => removeItem()}
        onPlayClick={() => loginDispatch({ type: "SHOW_AUTOMATION_GUIDE" })}
        title={
          <Menu
            pointing
            secondary
            vertical={false}
            className={`${styles.triggerGroupFilter} `}
            items={triggerGroupMenuItems}
            onItemClick={switchTriggerGroupType}
            activeIndex={triggerGroupMenuItems.findIndex(
              (i) => i.name === triggerGroupSelected
            )}
          />
        }
        afterMainRow={
          <div className={styles.afterMainRow}>
            <div className={styles.menu}>
              <Menu
                vertical={false}
                className={`${styles.triggerTypeFilter} `}
                items={getSelectedTriggerGroupItems()}
                onItemClick={switchTriggerTypeFilter}
                activeIndex={getSelectedTriggerGroupItems().findIndex(
                  (i) => i.name === triggerTypeSelected
                )}
              />
            </div>
          </div>
        }
      >
        {automationRules &&
        isAbleToCreateAutomation(
          automationRules,
          company?.maximumAutomations ?? 0
        ) &&
        builderBooted ? (
          <InfoTooltip
            placement={"bottom"}
            children={t("automation.tooltip.action.create")}
            trigger={
              <Link
                className={`ui button primary ${
                  isFreePlan(currentPlan) ? "disabled" : ""
                }`}
                to={{
                  pathname: routeTo("/automations/create"),
                  state: {
                    backToType: triggerTypeSelected,
                  },
                }}
              >
                {t("automation.buttons.create")}
              </Link>
            }
          />
        ) : (
          <InfoTooltip
            placement={"bottom"}
            children={t("automation.tooltip.maxRules")}
            trigger={
              <div className="ui button primary disabled">
                {t("automation.buttons.create")}
              </div>
            }
          />
        )}
      </GridHeader>
      <div className={`hide-scrollable-table ${styles.tableWrap}`}>
        <div className="stick-wrap">
          <Table sortable basic={"very"} className={"dnd"}>
            {automationRules === undefined || pending ? (
              <GridDummy
                loading={true}
                columnsNumber={triggerTypeSelected === "RecurringJob" ? 10 : 9}
                hasCheckbox
                rowSteps={4}
                renderHeader={() => (
                  <AutomationTableHeader
                    assignmentRules={automationRulesVisible}
                    strings={selectedRuleIds}
                    loading={true}
                    selectAll={selectAll}
                    triggerType={triggerTypeSelected}
                  />
                )}
              />
            ) : (
              <>
                <AutomationTableHeader
                  assignmentRules={automationRulesVisible}
                  strings={selectedRuleIds}
                  loading={false}
                  selectAll={selectAll}
                  triggerType={triggerTypeSelected}
                />
                <GridSelection
                  selectedItemsCount={selectedRuleIds.length}
                  itemsSingular={t("automation.grid.header.item.single")}
                  itemsPlural={t("automation.grid.header.item.plural")}
                  deleteConfirmationRequested={deleteConfirmationVisible}
                />
                {isFreePlan(currentPlan) ? (
                  <SandboxTableBodyContent
                    header={t("automation.grid.sandbox.header")}
                    content={t("automation.grid.sandbox.content")}
                  />
                ) : (
                  <ReactSortable
                    tag={"tbody"}
                    list={writableRules.map((r) => ({
                      ...r,
                      id: r.id ?? r.ruleName,
                    }))}
                    setList={noop}
                    onEnd={(ev) => {
                      reorderCompleteHandler(ev.oldIndex, ev.newIndex);
                    }}
                    animation={200}
                    forceFallback
                  >
                    {writableRules.map((rule: AssignmentRuleType) => (
                      <AutomationRuleRow
                        key={rule.id}
                        isDefaultRule={false}
                        selectHandler={(e: React.MouseEvent) =>
                          handleCellSelected(e, rule.id as string)
                        }
                        isSelected={selectedRuleIds.includes(rule.id as string)}
                        rule={rule}
                        onDuplicate={submitDuplicateRule}
                        onStatusToggle={submitToggleStatus}
                        triggerType={triggerTypeSelected}
                      />
                    ))}
                  </ReactSortable>
                )}
                {defaultRule &&
                  defaultRule.id &&
                  triggerTypeSelected === "Default" && (
                    <tbody>
                      <AutomationRuleRow
                        isDefaultRule={true}
                        selectHandler={(e: React.MouseEvent) =>
                          handleCellSelected(e, defaultRule.id as string)
                        }
                        isSelected={
                          selectedRuleIds.indexOf(defaultRule.id) > -1
                        }
                        rule={defaultRule}
                        triggerType={triggerTypeSelected}
                      />
                    </tbody>
                  )}
                {triggerTypeSelected &&
                  triggerTypeSelected !== "Default" &&
                  writableRules.length === 0 && (
                    <tbody>
                      <tr>
                        <div className={styles.emptyContentWrap}>
                          <EmptyListSplash
                            type={triggerTypeSelected}
                            defaultRuleId={defaultRule?.id}
                          />
                        </div>
                      </tr>
                    </tbody>
                  )}
              </>
            )}
          </Table>
        </div>
      </div>
    </>
  );
}

function TabItem(props: {
  children: ReactNode;
  rules?: AssignmentRuleType[];
  type: SelectTriggerType;
}) {
  const filter = getRuleFilter(props.type);
  const counter = props.rules?.filter(filter).length ?? 0;

  return (
    <>
      {props.children}
      <span className="counter">{counter}</span>
    </>
  );
}
