import { useCallback, useState } from "react";
import { get, getWithExceptions$ } from "../../api/apiRequest";
import { GET_TEAMS } from "../../api/apiPath";
import { denormalizeTeam, TeamNormalizedType } from "../../types/TeamType";
import { useAppDispatch, useAppSelector } from "../../AppRootContext";
import { equals } from "ramda";
import { map, delay, retryWhen, take } from "rxjs/operators";
import {
  fetchTeamsNormalized,
  fetchTeamsNormalized$,
} from "api/Company/fetchTeamsNormalized";

export function useTeams() {
  const booted = useAppSelector((s) => s.settings.teamsSettings.teamsLoaded);
  const teams = useAppSelector((s) => s.settings.teamsSettings.teams, equals);
  const loginDispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  const refreshTeams = useCallback(async () => {
    setLoading(true);
    try {
      const loadData = fetchTeamsNormalized$()
        .pipe(
          map((response) => response.data),
          retryWhen((e) => e.pipe(delay(1000), take(5)))
        )
        .toPromise();
      const resultsNormalized = await loadData;
      const teams = resultsNormalized.map(denormalizeTeam);
      loginDispatch({ type: "TEAMS_UPDATED", teams });

      return teams;
    } catch (e) {
      console.error("refreshTeams", e);
      return [];
    } finally {
      setLoading(false);
    }
  }, [loginDispatch]);

  return {
    refreshTeams,
    teams,
    booted,
    loading,
  };
}
