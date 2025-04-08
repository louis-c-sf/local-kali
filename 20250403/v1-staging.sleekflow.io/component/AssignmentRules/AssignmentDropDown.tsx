import React, { ReactNode, useEffect, useLayoutEffect, useState } from "react";
import {
  Dropdown,
  DropdownItemProps,
  DropdownProps,
  Image,
  Input,
} from "semantic-ui-react";
import UnassignedImg from "../../assets/images/unassigned.svg";
import ByQueueImg from "../../assets/images/by-queue.svg";
import PersonImg from "../../assets/images/person.svg";
import TeamImg from "../../assets/images/icons/team.svg";
import { staffDisplayName } from "../Chat/utils/staffDisplayName";
import produce from "immer";
import { assoc, whereEq } from "ramda";
import { useTranslation } from "react-i18next";
import { InfoTooltip } from "../shared/popup/InfoTooltip";
import { useAppSelector } from "../../AppRootContext";
import { StaffType } from "../../types/StaffType";
import styles from "./AssignmentDropDown.module.css";
import { StaffAvatar } from "component/shared/Avatar/StaffAvatar";

export default AssignmentDropdown;

function toStaffDropdownItem(staff: StaffType, idx: number): DropdownItemProps {
  return {
    image: (
      <StaffAvatar
        avatarProps={{ maxInitials: 2, round: true, size: "20px" }}
        imageProps={{ avatar: true, circular: true }}
        size={"20px"}
        staff={staff}
      />
    ),
    key: idx,
    text: staffDisplayName(staff),
    value: staff.userInfo.id,
  };
}

interface AssignDropdownOption extends DropdownItemProps {
  tooltip?: ReactNode;
}

function ItemTooltipped(props: {
  text: string;
  tooltip: ReactNode;
  icon?: string;
}) {
  const icon = props.icon ? <Image src={props.icon} /> : null;
  return (
    <InfoTooltip
      placement={"right"}
      trigger={
        <div className={"text-full"}>
          {icon}
          <span className={"text"}>{props.text}</span>
        </div>
      }
    >
      {props.tooltip}
    </InfoTooltip>
  );
}

function AssignmentDropdown(props: {
  initAssignmentType: string;
  initStaff?: string;
  initTeam?: number;
  selectedAssignmentId?: string;
  updateAssignmentValue: (type: string, staff: string, team?: number) => any;
  setHiddenDropdown?: Function;
  disabled?: boolean;
  hideTeamOption?: boolean;
  initStaffList?: StaffType[];
}) {
  const {
    initAssignmentType,
    initStaff,
    initTeam,
    updateAssignmentValue,
    hideTeamOption = false,
    initStaffList = [],
  } = props;
  const [staffList, settings] = useAppSelector((s) => [
    s.staffList,
    s.settings,
  ]);
  const initStaffIdList = initStaffList.map((staff) => staff.userInfo.id);
  const [initStaffOptions, setInitStaffOptions] = useState(
    initStaffList.length !== 0 ? initStaffList : staffList
  );
  const { t } = useTranslation();

  const [selectedAssignmentType, setSelectedAssignmentType] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(initStaff);
  const [selectedTeam, setSelectedTeam] = useState<number | undefined>(
    undefined
  );

  const [openAssignType, setOpenAssignType] = useState(false);
  const [openStaff, setOpenStaff] = useState(false);
  const [openTeams, setOpenTeams] = useState(false);
  const [openTeamType, setOpenTeamType] = useState(false);
  const [openTeamStaff, setOpenTeamStaff] = useState(false);

  const initStep = produce(initAssignmentType, (draft) => {
    const initAssignmentKey = draft?.toLowerCase() ?? "";
    if (initTeam === undefined) {
      const stepMap = {
        unassigned: "type.unassigned",
        queuebased: "type.queuebased",
        specificperson: "type.specificperson.selected",
      };
      return stepMap[initAssignmentKey] ?? "type";
    } else {
      const stepMap = {
        unassigned: "type.specificteam.unassigned",
        queuebased: "type.specificteam.queuebased",
        specificperson: "type.specificteam.specificperson.selected",
      };
      return stepMap[initAssignmentKey] ?? "type";
    }
  });

  const [step, setStep] = useState("");
  useEffect(() => {
    if (!step && initStep) {
      setStep(initStep);
    }
  }, [initStep, step]);

  useEffect(() => {
    if (!selectedTeam) {
      setSelectedTeam(initTeam);
    }
  }, [initTeam, selectedTeam]);

  useEffect(() => {
    if (!selectedAssignmentType) {
      setSelectedAssignmentType(initAssignmentType);
    }
  }, [initAssignmentType]);
  const teamsVisible = settings.teamsSettings.teams.filter(
    (t) => t.members.length > 0
  );
  let assignmentOptions: AssignDropdownOption[] = [
    {
      key: "unassigned",
      value: "unassigned",
      className: "tooltipped",
      text: t("automation.action.assignment.field.type.option.unassigned"),
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.unassigned")}
          tooltip={t("automation.tooltip.form.assign.option.base.unassigned")}
          icon={UnassignedImg}
        />
      ),
      onClick: changeAssignmentType,
    },
    {
      key: "queue",
      value: "queuebased",
      className: "tooltipped",
      text: t("automation.action.assignment.field.type.option.queue"),
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.queue")}
          tooltip={t("automation.tooltip.form.assign.option.base.queue")}
          icon={ByQueueImg}
        />
      ),
      onClick: changeAssignmentType,
    },
    {
      key: "person",
      value: "specificperson",
      className: "tooltipped",
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.person")}
          tooltip={t("automation.tooltip.form.assign.option.base.person")}
          icon={PersonImg}
        />
      ),
      onClick: changeAssignmentType,
    },
    {
      key: "team",
      value: "specificteam",
      className: "tooltipped",
      visible: () => {
        return !hideTeamOption && teamsVisible.length > 0;
      },
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.team")}
          tooltip={t("automation.tooltip.form.assign.option.base.team")}
          icon={TeamImg}
        />
      ),
      onClick: changeAssignmentType,
    },
  ];

  const teamOptions = teamsVisible
    .map<DropdownItemProps>((team, idx) => {
      return {
        text: team.name,
        key: String(idx),
        value: team.id,
        onClick: changeTeam,
      };
    })
    .concat({
      key: "back",
      text: t("automation.action.assignment.action.back"),
      value: "back",
      icon: "arrow left",
      onClick: resetToFirstStep,
    });

  const teamTypeOptions: AssignDropdownOption[] = [
    {
      key: "unassigned",
      value: "unassigned",
      className: "tooltipped",
      text: t("automation.action.assignment.field.type.option.unassigned"),
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.unassigned")}
          tooltip={t("automation.tooltip.form.assign.option.team.unassigned")}
          icon={UnassignedImg}
        />
      ),
      onClick: changeTeamType,
    },
    {
      key: "queue",
      value: "queuebased",
      className: "tooltipped",
      text: t("automation.action.assignment.field.type.option.queue"),
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.queue")}
          tooltip={t("automation.tooltip.form.assign.option.team.queue")}
          icon={ByQueueImg}
        />
      ),
      onClick: changeTeamType,
    },
    {
      key: "person",
      value: "specificperson",
      className: "tooltipped",
      content: (
        <ItemTooltipped
          text={t("automation.action.assignment.field.type.option.person")}
          tooltip={t("automation.tooltip.form.assign.option.team.person")}
          icon={PersonImg}
        />
      ),
      onClick: changeTeamType,
    },
    {
      key: "back",
      text: t("automation.action.assignment.action.back"),
      value: "back",
      icon: "arrow left",
      onClick: resetToFirstStep,
    },
  ];

  let teamTypeValue = undefined;
  switch (true) {
    case step === "type.specificteam.unassigned":
      teamTypeValue = "unassigned";
      break;
    case step === "type.specificteam.queuebased":
      teamTypeValue = "queuebased";
      break;
    case step.startsWith("type.specificteam.specificperson"):
      teamTypeValue = "specificperson";
      break;
  }

  const staffOptions = initStaffOptions
    .map<DropdownItemProps>(toStaffDropdownItem)
    .map(assoc("onClick", changeStaff))
    .concat({
      text: t("automation.action.assignment.action.back"),
      value: "back",
      icon: "arrow left",
      onClick: resetToFirstStep,
    });

  function resetToFirstStep(e: React.MouseEvent) {
    e.stopPropagation();
    setStep("type");
    setOpenAssignType(true);
    syncAssignmentValue("", "", undefined);
  }

  function resetToTeamTypeStep(e: React.MouseEvent) {
    e.stopPropagation();
    setStep("type.specificteam.selected");
    setOpenTeamType(true);
    syncAssignmentValue("", "", selectedTeam);
  }

  function syncAssignmentValue(type: string, staff: string, team?: number) {
    updateAssignmentValue(type, staff, team);
    setSelectedAssignmentType(type);
    setSelectedStaff(staff);
    setSelectedTeam(team);
  }

  function changeAssignmentType(e: React.MouseEvent, data: DropdownItemProps) {
    e.stopPropagation();
    const specificType = data.value as string;

    setSelectedAssignmentType(specificType.toLowerCase());
    switch (specificType) {
      case "specificperson":
        setStep("type.specificperson.?");
        setSelectedStaff("");
        setSelectedTeam(undefined);
        setOpenStaff(true);
        syncAssignmentValue("specificperson", "", undefined);
        break;

      case "specificteam":
        setStep("type.specificteam.?");
        setSelectedTeam(undefined);
        setSelectedStaff("");
        setOpenTeams(true);
        syncAssignmentValue("specificteam", "", undefined);
        break;

      case "queuebased":
        setStep("type.queuebased");
        syncAssignmentValue("queuebased", "", undefined);
        break;
      case "unassigned":
        setStep("type.unassigned");
        syncAssignmentValue("unassigned", "", undefined);
        break;

      default:
        setStep("type");
        syncAssignmentValue(specificType.toLowerCase(), "");
        break;
    }
    setOpenAssignType(false);
  }

  function changeStaff(e: React.MouseEvent, data: DropdownItemProps) {
    e.stopPropagation();
    setStep("type.specificperson.selected");
    const staffValue = data.value?.toString() ?? "";
    syncAssignmentValue("specificperson", staffValue, undefined);
    setOpenStaff(false);
  }

  function changeTeam(e: React.MouseEvent, data: DropdownItemProps) {
    e.stopPropagation();
    const teamId = data.value as number;
    setStep("type.specificteam.selected");
    syncAssignmentValue("", "", teamId);
    setOpenTeamType(true);
    setOpenTeams(false);
  }

  function changeTeamType(e: React.MouseEvent, data: DropdownItemProps) {
    e.stopPropagation();
    const typeValue = data.value as string;
    if (typeValue === "specificperson") {
      setStep("type.specificteam.specificperson.?");
      setOpenTeamStaff(true);
      syncAssignmentValue("specificperson", "", selectedTeam);
    } else {
      setStep(`type.specificteam.${typeValue}`);
      syncAssignmentValue(typeValue, "", selectedTeam);
    }
    setOpenTeamType(false);
  }

  function changeTeamStaff(e: React.MouseEvent, data: DropdownItemProps) {
    e.stopPropagation();
    const staffValue = data.value as string;
    setStep(`type.specificteam.specificperson.selected`);
    syncAssignmentValue(selectedAssignmentType, staffValue, selectedTeam);
    setOpenTeamStaff(false);
  }

  const disableAll = props.disabled ?? false;

  const currentTeam = settings.teamsSettings.teams.find(
    (t) => t.id === selectedTeam
  );
  const teamStaffOptions =
    currentTeam?.members
      .map<DropdownItemProps>(toStaffDropdownItem)
      .map(assoc("onClick", changeTeamStaff))
      .concat({
        text: t("automation.action.assignment.action.back"),
        value: "back",
        icon: "arrow left",
        onClick: resetToTeamTypeStep,
      }) ?? [];

  return (
    <div className={styles.grid}>
      <div className={styles.column}>
        <div className={styles.root}>
          {(step === "type" ||
            step === "type.queuebased" ||
            step === "type.unassigned") && (
            <Selector
              open={openAssignType}
              placeholder={t(
                "automation.action.assignment.field.type.placeholder"
              )}
              className={`${styles.rule} ${styles.display}`}
              value={selectedAssignmentType}
              options={assignmentOptions.filter((o) =>
                o.visible ? o.visible() : true
              )}
              onClose={() => setOpenAssignType(false)}
              onClick={() => {
                setOpenAssignType(true);
                setOpenStaff(false);
                setOpenTeams(false);
                setOpenTeamType(false);
                setOpenTeamStaff(false);
              }}
              disabled={disableAll}
              name={"assignment-type"}
              search={false}
            />
          )}
          {step.startsWith("type.specificperson") && (
            <Selector
              id={"assign-person-dropdown"}
              search
              open={openStaff}
              className={styles.staff}
              placeholder={t(
                "automation.action.assignment.field.staff.placeholder"
              )}
              value={selectedStaff}
              onClose={() => setOpenStaff(false)}
              onClick={() => {
                setOpenAssignType(false);
                setOpenStaff(true);
                setOpenTeams(false);
                setOpenTeamType(false);
                setOpenTeamStaff(false);
              }}
              options={staffOptions}
              disabled={disableAll}
              name={"person-staff"}
            />
          )}
          {!hideTeamOption &&
            step.startsWith("type.specificteam") &&
            teamOptions.length > 0 && (
              <Selector
                id={"assign-team-dropdown"}
                search
                open={openTeams}
                className={styles.staff}
                placeholder={t(
                  "automation.action.assignment.field.team.placeholder"
                )}
                value={selectedTeam}
                onClose={() => setOpenTeams(false)}
                onClick={() => {
                  setOpenAssignType(false);
                  setOpenStaff(false);
                  setOpenTeams(true);
                  setOpenTeamType(false);
                  setOpenTeamStaff(false);
                }}
                options={teamOptions}
                disabled={disableAll}
                name={"team-team"}
              />
            )}
        </div>
      </div>
      {!hideTeamOption && (
        <div className={styles.column}>
          <div className={styles.root}>
            {step.startsWith("type.specificteam.") &&
              step !== "type.specificteam.?" &&
              !step.startsWith("type.specificteam.specificperson.") && (
                <Selector
                  open={openTeamType}
                  className={styles.staff}
                  placeholder={t(
                    "automation.action.assignment.field.teamAssign.placeholder"
                  )}
                  value={teamTypeValue}
                  onClose={() => setOpenTeamType(false)}
                  onClick={() => {
                    setOpenAssignType(false);
                    setOpenStaff(false);
                    setOpenTeams(false);
                    setOpenTeamType(true);
                    setOpenTeamStaff(false);
                  }}
                  options={teamTypeOptions}
                  disabled={disableAll}
                  name={"team-assign-type"}
                  search={false}
                />
              )}
            {step.startsWith("type.specificteam.specificperson.") && (
              <Selector
                id={"assign-team-person-dropdown"}
                search
                open={openTeamStaff}
                className={`${styles.staff} assignment-staff`}
                placeholder={t(
                  "automation.action.assignment.field.staff.placeholder"
                )}
                value={selectedStaff}
                onClose={() => setOpenTeamStaff(false)}
                onClick={() => {
                  setOpenAssignType(false);
                  setOpenStaff(false);
                  setOpenTeams(false);
                  setOpenTeamType(false);
                  setOpenTeamStaff(true);
                }}
                options={teamStaffOptions}
                disabled={disableAll}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface SelectorProps extends DropdownProps {
  onClick: () => void;
  id?: string;
  options: AssignDropdownOption[];
}

function Selector(props: SelectorProps) {
  const selectedOption = props.options?.find(
    whereEq({ value: props.value as string })
  );

  useLayoutEffect(() => {
    if (props.open && props.id && props.search) {
      const input = document.querySelector<HTMLInputElement>(
        `#${props.id} input.search`
      );
      if (input) {
        input.value = "";
        input.focus();
      }
    }
  }, [props.open]);

  return (
    <Input>
      {props.open && (
        <Dropdown
          id={props.id}
          selectOnBlur={false}
          upward={false}
          selection
          fluid
          closeOnBlur
          {...props}
        />
      )}
      {!props.open && (
        <div
          className={`ui fluid search selection dropdown assignment-staff ${
            props.disabled ? "disabled" : ""
          }`}
          onClick={props.disabled ? undefined : props.onClick}
        >
          <div className="text">
            {props.text || selectedOption?.text || props.placeholder}
          </div>
          <i className="dropdown icon" />
        </div>
      )}
    </Input>
  );
}
