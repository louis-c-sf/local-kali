import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../../AppRootContext";
import useRouteConfig from "../../../config/useRouteConfig";
import fetchAutomationHistories from "../../../api/Company/fetchAutomationHistories";
import {
  AutomationHistoriesFilterParamsType,
  AutomationHistoriesPaginationParamsType,
  AutomationHistoryResponseType,
  AutomationHistoryType,
} from "../../../types/AssignmentRuleType";
import fetchAutomation from "../../../api/Company/fetchAutomation";
import { Pagination, PaginationProps } from "semantic-ui-react";
import HistoryGridHeader from "./HistoryGridHeader";
import HistoryTable from "./HistoryTable";
import ReplayModal from "./ReplayModal";
import { postWithExceptions } from "../../../api/apiRequest";
import {
  POST_AUTOMATION_HISTORY_REPLAY,
  POST_REPLAY_DM_ACTION,
} from "../../../api/apiPath";
import BannerMessage from "../../BannerMessage/BannerMessage";
import { useFlashMessageChannel } from "../../BannerMessage/flashBannerMessage";
import styles from "./AutomationHistoryContent.module.css";
import { BackLink } from "../../shared/nav/BackLink";
import fetchFbIgAutomationHistories from "../../../api/Company/fetchFbIgAutomationHistories";
import {
  DefaultTabInfo,
  FbIgAutomationHistoryResponseType,
  FbIgAutomationHistoryType,
  TabEnum,
  TabInfoType,
} from "../AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";
import { htmlEscape } from "../../../lib/utility/htmlEscape";

export default AutomationHistoryContent;

function AutomationHistoryContent() {
  const { id: automationId } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const history = useHistory();
  const { routeTo } = useRouteConfig();
  const flash = useFlashMessageChannel();
  const loginDispatch = useAppDispatch();
  const selectedAutomationRule = useAppSelector((s) => s.automations.selected);
  const [selectedId, setSelectedId] = useState(0);
  const [autoReplyId, setAutoReplyId] = useState("");
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [isReplayModalPending, setIsReplayModalPending] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const [filters, setFilters] = useState<AutomationHistoriesFilterParamsType>(
    {}
  );
  const [totalPages, setTotalPages] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const LIMIT = 100;
  const [tab, setTab] = useState<TabEnum>(TabEnum.Sent);
  const [tabInfo, setTabInfo] = useState<TabInfoType>(DefaultTabInfo);

  const goBack = useCallback(() => {
    history.replace(routeTo("/automations"));
  }, [history, routeTo]);

  const getSelectedAutomation = useCallback(
    async (automationId: string) => {
      try {
        const result = await fetchAutomation(automationId);
        const {
          assignmentId,
          assignmentRuleName,
          automationType,
          status,
          isDefault,
        } = result[0];
        loginDispatch({
          type: "AUTOMATION_RULE_SELECTED",
          selectedAutomationRule: {
            id: assignmentId,
            ruleName: assignmentRuleName,
            automationType,
            status,
            isDefault,
          },
        });
      } catch (error) {
        console.error(`fetchAutomation error ${error}`);
      }
    },
    [loginDispatch]
  );

  const getAutomationHistories = useCallback(
    async (isFbIgAutomation: boolean) => {
      const paginationParams: AutomationHistoriesPaginationParamsType = {
        offset: (activePage - 1) * LIMIT,
        limit: LIMIT,
      };
      const fbIgParam = isFbIgAutomation ? { tab } : {};
      const param = { ...paginationParams, ...filters, ...fbIgParam };
      try {
        let count: number = 0;
        let automationHistories: (
          | AutomationHistoryType
          | FbIgAutomationHistoryType
        )[] = [];
        setIsLoading(true);
        if (isFbIgAutomation) {
          const result: FbIgAutomationHistoryResponseType =
            await fetchFbIgAutomationHistories(automationId, param);
          count = result.sendDirectMessageNumber;
          automationHistories = result.triggerHistories;
          setTabInfo({
            sent: result.sendDirectMessageNumber,
            newContact: {
              number: result.newContactNumber,
              percentage: result.newContactPercentage,
            },
            replied: {
              number: result.userReplyDmNumber,
              percentage: result.repliedToDmPercentage,
            },
          });
        } else {
          const result: AutomationHistoryResponseType =
            await fetchAutomationHistories(automationId, param);
          count = result.count;
          automationHistories = result.automationHistories;
        }
        const total = count / LIMIT;
        const numberOfPages =
          Math.round(total) + (total > Math.round(total) ? 1 : 0);
        setTotalPages(numberOfPages === 0 ? activePage : numberOfPages);
        loginDispatch({
          type: "UPDATE_SELECTED_AUTOMATION_HISTORIES",
          automationHistories,
        });
      } catch (error) {
        console.error(`fetchAutomationRules error ${error}`);
        flash(t("flash.automation.notFound"));
        setTotalPages(0);
        goBack();
      } finally {
        setIsLoading(false);
      }
    },
    [activePage, filters, tab, automationId, flash, goBack, loginDispatch, t]
  );

  useEffect(() => {
    if (!selectedAutomationRule) {
      getSelectedAutomation(automationId);
    }
  }, [
    getSelectedAutomation,
    automationId,
    JSON.stringify(selectedAutomationRule?.automationType),
  ]);
  //Can't add selectedAutomationRule in dependency, due to getSelectedAutomation will update selectedAutomationRule and it will become a loop

  useEffect(() => {
    if (!selectedAutomationRule) {
      return;
    }
    getAutomationHistories(
      ["InstagramMediaComment", "FacebookPostComment"].includes(
        selectedAutomationRule?.automationType
      )
    );
  }, [
    JSON.stringify(selectedAutomationRule?.automationType),
    getAutomationHistories,
    tab,
  ]);

  if (!selectedAutomationRule) {
    return null;
  }

  const { ruleName, isDefault, automationType, status, automationHistories } =
    selectedAutomationRule;

  async function replayRun(isFbIgAutomation: boolean) {
    const mapObj = isFbIgAutomation
      ? {
          "{fbIgAutoReplyId}": autoReplyId,
          "{historyId}": selectedId,
        }
      : {
          "{automationId}": automationId,
          "{historyId}": selectedId,
        };
    const reg = new RegExp(Object.keys(mapObj).join("|"), "gi");
    const path = isFbIgAutomation
      ? POST_REPLAY_DM_ACTION.replace(reg, (matched) => mapObj[matched])
      : POST_AUTOMATION_HISTORY_REPLAY.replace(
          reg,
          (matched) => mapObj[matched]
        );
    try {
      setIsReplayModalPending(true);
      await postWithExceptions(path, { param: {} });
      flash(t("flash.automation.replay.success"));
      setIsReplayModalOpen(false);
      if (selectedAutomationRule) {
        getAutomationHistories(
          ["InstagramMediaComment", "FacebookPostComment"].includes(
            selectedAutomationRule?.automationType
          )
        );
      }
    } catch (error) {
      flash(
        t("flash.automation.replay.error", { error: `${htmlEscape(error)}` })
      );
      console.error(error);
    } finally {
      setIsReplayModalPending(false);
    }
  }

  function handleReplayClick(
    e: React.MouseEvent,
    id: number,
    autoReplyId?: string
  ) {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(id);
    if (autoReplyId) {
      setAutoReplyId(autoReplyId);
    }
    setIsReplayModalOpen(true);
  }

  function handlingPageChange(e: React.MouseEvent, data: PaginationProps) {
    setActivePage(Number(data.activePage) || activePage);
  }

  function handleFilterChange(filters: AutomationHistoriesFilterParamsType) {
    setFilters(filters);
  }

  return (
    <div className={`post-login`}>
      <div className={`main`}>
        <div className={styles.backLink}>
          <BackLink onClick={goBack}>{t("nav.backShort")}</BackLink>
        </div>
        <div
          className={`automation-history main-primary-column ${styles.content}`}
        >
          <HistoryGridHeader
            ruleName={ruleName}
            isDefault={isDefault}
            automationType={automationType}
            status={status}
            onFilterChange={handleFilterChange}
            setTab={setTab}
            tab={tab}
            tabInfo={tabInfo}
          />
          <HistoryTable
            automationHistories={automationHistories}
            onReplayClick={handleReplayClick}
            isLoading={isLoading}
            hasTab={["InstagramMediaComment", "FacebookPostComment"].includes(
              selectedAutomationRule?.automationType
            )}
          />
          {!isLoading && totalPages > 1 && (
            <footer className={styles.footer}>
              <Pagination
                activePage={activePage}
                onPageChange={handlingPageChange}
                totalPages={totalPages}
                siblingRange={5}
              />
            </footer>
          )}
        </div>
      </div>
      <ReplayModal
        isOpen={isReplayModalOpen}
        isPending={isReplayModalPending}
        onConfirm={() =>
          replayRun(
            ["InstagramMediaComment", "FacebookPostComment"].includes(
              selectedAutomationRule?.automationType
            )
          )
        }
        onCancel={() => setIsReplayModalOpen(false)}
      />
      <BannerMessage />
    </div>
  );
}
