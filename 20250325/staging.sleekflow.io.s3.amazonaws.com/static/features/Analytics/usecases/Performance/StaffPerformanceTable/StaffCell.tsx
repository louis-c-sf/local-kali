import React from "react";
import styles from "features/Analytics/usecases/Performance/StaffPerformanceTable/StaffCell.module.css";
import { StaffType } from "types/StaffType";
import { StaffAvatar } from "component/shared/Avatar/StaffAvatar";
import { staffDisplayName } from "component/Chat/utils/staffDisplayName";
import { useTeams } from "container/Settings/useTeams";
import { matchesStaff } from "types/TeamType";

export function StaffCell(props: { staff: StaffType }) {
  const { staff } = props;
  const { teams } = useTeams();
  const relatedTeams = teams
    .filter((t) => t.members.some(matchesStaff(staff)))
    .map((t) => t.name);

  return (
    <div className={styles.root}>
      <div className={styles.pic}>
        <StaffAvatar staff={staff} size={"32px"} />
      </div>
      <div className={styles.name}>{staffDisplayName(staff)}</div>
      {relatedTeams.length > 0 && (
        <div className={styles.team}>{relatedTeams.join(", ")}</div>
      )}
    </div>
  );
}
