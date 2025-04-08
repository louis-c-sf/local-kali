import { useEffect, useState } from "react";
import { WhatsappCloudApiUsageRecordType } from "types/CompanyType";
import { fetchUsageRecord } from "./fetchUsageRecord";

export default function useFetchUsageRecord() {
  const [loading, setLoading] = useState(false);
  const [usageRecords, setUsageRecords] = useState<
    WhatsappCloudApiUsageRecordType[]
  >([]);
  useEffect(() => {
    setLoading(true);
    fetchUsageRecord()
      .then((records) => {
        setUsageRecords(records);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);
  return {
    loading,
    usageRecords,
  };
}
