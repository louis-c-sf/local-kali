import React, { useState } from "react";
import { Dropdown, Input } from "semantic-ui-react";
import { getStaffId } from "../../../types/TeamType";
import { StaffType } from "../../../types/StaffType";
import { useTeams } from "../../../container/Settings/useTeams";
import {
  TeamCollapsible,
  useCollapsibleTeams,
} from "../../Chat/TeamCollapsible";
import { StaffItemAvatar } from "../../Chat/StaffItemAvatar";
import { staffDisplayName } from "../../Chat/utils/staffDisplayName";
import { useTranslation } from "react-i18next";

function ApplyCollaboratorField(props: {
  onSelect: (staffId: string[]) => void;
}) {
  const { onSelect } = props;
  const [searchText, setSearchText] = useState<string>("");
  const [selectedStaffs, setSelectedStaffs] = useState<StaffType[]>([]);
  const { t } = useTranslation();
  const { teams } = useTeams();

  const { isCollapsed, teamsCollapsible, toggleCollapse } = useCollapsibleTeams(
    {
      allTeams: teams,
      searchQuery: searchText,
      opened: true,
      isUserVisible: (u) =>
        !selectedStaffs.find(
          (selected) => getStaffId(selected) === getStaffId(u)
        ),
    }
  );

  const renderStaffOption = (staff: StaffType) => (
    <div
      className="item search-staff"
      onClick={() => {
        const newValue = [...selectedStaffs, staff];
        setSelectedStaffs(newValue);
        onSelect(newValue.map((v) => getStaffId(v)));
      }}
      key={getStaffId(staff)}
    >
      <div className="staff">
        <StaffItemAvatar
          staff={{
            name: staffDisplayName(staff),
            profilePicture: staff.profilePicture,
            profilePictureURL: staff.profilePictureURL,
            ...staff.userInfo,
          }}
        />
        <div className="info">
          <div className="name">{staffDisplayName(staff)}</div>
        </div>
      </div>
    </div>
  );

  const renderStaffTrigger = (staff: StaffType) => {
    const staffId = getStaffId(staff);
    return (
      <a className="ui label item search-staff" key={staffId}>
        <div className="staff">
          <StaffItemAvatar
            staff={{
              name: staffDisplayName(staff),
              profilePicture: staff.profilePicture,
              profilePictureURL: staff.profilePictureURL,
              ...staff.userInfo,
            }}
          />
          <div className="info">
            <div className="name">{staffDisplayName(staff)}</div>
          </div>
          <i
            className="delete icon"
            aria-hidden
            onClick={(e) => {
              e.stopPropagation();
              const newValue = selectedStaffs.filter(
                (selected) => getStaffId(selected) !== staffId
              );
              setSelectedStaffs(newValue);
              onSelect(newValue.map((v) => getStaffId(v)));
            }}
          />
        </div>
      </a>
    );
  };

  return (
    <Dropdown
      multiple
      fluid
      className="bulkEdit"
      trigger={selectedStaffs.map((staff) => renderStaffTrigger(staff))}
    >
      <Dropdown.Menu>
        <Input
          icon="search"
          fluid
          iconPosition="left"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          placeholder={t("chat.form.input.search.placeholder")}
        />
        <Dropdown.Menu scrolling>
          {teamsCollapsible.map((team) => {
            return (
              <div>
                <TeamCollapsible
                  key={team.id}
                  team={team}
                  collapsed={
                    searchText.length > 0 ? false : isCollapsed(team.id)
                  }
                  toggle={toggleCollapse}
                  renderItem={renderStaffOption}
                />
              </div>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ApplyCollaboratorField;
