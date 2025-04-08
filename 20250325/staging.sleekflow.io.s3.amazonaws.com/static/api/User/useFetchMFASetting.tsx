import { useEffect, useState } from "react";
import { fetchMFASetting, MFAResponseType } from "./fetchMFASetting";

function denormalizedMFAResponse(response: MFAResponseType) {
  return Array.isArray(response)
    ? response.find((s) => s.mfa_type === "totp")?.mfa_id || ""
    : "";
}

export function useFetchMFASettings({
  staffId,
  isAdmin,
}: {
  staffId: string;
  isAdmin: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [userMFA, setUserMFA] = useState("");
  useEffect(() => {
    if (!staffId || !isAdmin) {
      return;
    }
    setLoading(true);
    fetchMFASetting(staffId)
      .then((res) => {
        setUserMFA(denormalizedMFAResponse(res));
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, [staffId, isAdmin]);
  async function refresh() {
    const result = await fetchMFASetting(staffId);
    setUserMFA(denormalizedMFAResponse(result));
  }
  return {
    loading,
    userMFA,
    refresh,
  };
}
