import React, { useEffect } from "react";
import {
  get,
  postWithExceptions,
  getWithExceptions,
} from "../../api/apiRequest";
import { GET_TEAMS, POST_TEAMS_REMOVE_USER } from "../../api/apiPath";
import {
  denormalizeTeam,
  TeamNormalizedType,
  TeamType,
} from "../../types/TeamType";
import { Redirect, useParams } from "react-router";
import { ManageTeams } from "../../component/Settings/SettingTeams/ManageTeams";
import { ManageTeamMembers } from "../../component/Settings/SettingTeams/ManageTeamMembers";
import { useFeaturesGuard } from "../../component/Settings/hooks/useFeaturesGuard";
import { useAppSelector } from "../../AppRootContext";
import { fetchTeamsNormalized } from "api/Company/fetchTeamsNormalized";

export async function fetchTeams(): Promise<TeamType[]> {
  const resultsNormalized = await fetchTeamsNormalized();
  return resultsNormalized.map(denormalizeTeam);
}

export async function removeMember(
  teamId: string,
  staffId: string[]
): Promise<TeamType> {
  const result: TeamNormalizedType = await postWithExceptions(
    POST_TEAMS_REMOVE_USER.replace("{id}", teamId),
    { param: { StaffIds: staffId } }
  );
  return denormalizeTeam(result);
}

export function SettingTeams() {
  const currentPlan = useAppSelector((s) => s.currentPlan);
  const featuresGuard = useFeaturesGuard();
  const { teamId } = useParams();

  if (currentPlan.id && !featuresGuard.canUseTeams()) {
    return <Redirect to={"/settings/usermanagement"} />;
  }
  return (
    <div className={"content team-management"}>
      <div className="container no-scrollbars">
        {teamId ? <ManageTeamMembers teamId={teamId} /> : <ManageTeams />}
      </div>
    </div>
  );
}
