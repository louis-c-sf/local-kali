import React from "react";
import { NavLink } from "react-router-dom";
import moment from "moment";
import Avatar from "react-avatar";
import { useTranslation } from "react-i18next";
import useRouteConfig from "../../../config/useRouteConfig";
import { useCurrentUtcOffset } from "../../Chat/hooks/useCurrentUtcOffset";
import { AutomationHistoryType } from "../../../types/AssignmentRuleType";
import GridDummy from "../../shared/Placeholder/GridDummy";
import EmptyContent from "../../EmptyContent";
import { Button, Image, Table } from "semantic-ui-react";
import ReplayIcon from "./assets/replay.svg";
import SuccessIcon from "./assets/success-icon.svg";
import FailedIcon from "./assets/failed-icon.svg";
import styles from "./HistoryTable.module.css";
import { FbIgAutomationHistoryType } from "../AutomationRuleEdit/CreateRule/FbIg/PostCommentTypes";

interface HistoryTablePropsType {
  automationHistories?: (AutomationHistoryType | FbIgAutomationHistoryType)[];
  onReplayClick: (
    e: React.MouseEvent,
    id: number,
    autoReplyId?: string
  ) => void;
  isLoading: boolean;
  hasTab: boolean;
}

export default HistoryTable;

function HistoryTable(props: HistoryTablePropsType) {
  const { automationHistories, onReplayClick, isLoading, hasTab } = props;
  const hasResults = Boolean(
    automationHistories && automationHistories?.length > 0
  );
  const { t } = useTranslation();

  return isLoading || hasResults ? (
    <div
      className={`hide-scrollable-table ${styles.table} ${
        hasTab ? "hasTab" : ""
      }`}
    >
      <div className="stick-wrap">
        <Table sortable basic={"very"}>
          {isLoading ? (
            <GridDummy
              loading={true}
              columnsNumber={3}
              hasCheckbox
              rowSteps={4}
              renderHeader={() => <TableHeader />}
            />
          ) : (
            <>
              <TableHeader />
              <Table.Body>
                {automationHistories?.map(
                  (
                    history: AutomationHistoryType | FbIgAutomationHistoryType
                  ) => (
                    <TableRow
                      key={history.id}
                      data={history}
                      onReplayClick={onReplayClick}
                    />
                  )
                )}
              </Table.Body>
            </>
          )}
        </Table>
      </div>
    </div>
  ) : (
    <div className={styles.emptyContent}>
      <EmptyContent header={t("automation.history.noResults")} />
    </div>
  );
}

function TableHeader() {
  const { t } = useTranslation();

  return (
    <Table.Header className={styles.tableHeader}>
      <Table.Row>
        <Table.HeaderCell className={styles.status}>
          {t("automation.history.grid.header.col.status")}
        </Table.HeaderCell>
        <Table.HeaderCell>
          {t("automation.history.grid.header.col.contactProfile")}
        </Table.HeaderCell>
        <Table.HeaderCell className={styles.dateTriggered}>
          {t("automation.history.grid.header.col.dateTriggered")}
        </Table.HeaderCell>
      </Table.Row>
    </Table.Header>
  );
}

function TableRow(props: {
  data: AutomationHistoryType | FbIgAutomationHistoryType;
  onReplayClick: (
    e: React.MouseEvent,
    id: number,
    autoReplyId?: string
  ) => void;
}) {
  const { data, onReplayClick } = props;
  const { status, createdAt, name, id, targetUserProfileId } = data;
  const fbIgAutoReplyId = "fbIgAutoReplyId" in data ? data.fbIgAutoReplyId : "";
  const isSuccess = status === "Success";
  const utcOffset = useCurrentUtcOffset();
  const { t } = useTranslation();
  const { routeTo } = useRouteConfig();

  return (
    <Table.Row>
      <Table.Cell
        className={`${styles.status} ${
          isSuccess ? styles.success : styles.failed
        }`}
      >
        <div className={styles.statusWrap}>
          <Image src={isSuccess ? SuccessIcon : FailedIcon} />
          <span>
            {isSuccess
              ? t("automation.history.status.success")
              : t("automation.history.status.errored")}
          </span>
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className={styles.contactWarp}>
          <NavLink
            to={routeTo(`/profile/${targetUserProfileId}`)}
            className={styles.link}
          >
            <Avatar name={name} round={true} maxInitials={2} size={"24px"} />
            <span className={styles.name}>{name}</span>
          </NavLink>
          {!isSuccess && (
            <Button
              onClick={(e) => onReplayClick(e, id, fbIgAutoReplyId)}
              loading={false}
            >
              <Image src={ReplayIcon} />
              <span>{t("automation.history.buttons.replay")}</span>
            </Button>
          )}
        </div>
      </Table.Cell>
      <Table.Cell className={styles.dateTriggered}>
        {moment(createdAt).utcOffset(utcOffset).format("LLL")}
      </Table.Cell>
    </Table.Row>
  );
}
