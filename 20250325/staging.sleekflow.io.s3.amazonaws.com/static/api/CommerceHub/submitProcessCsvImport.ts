import { postWithExceptions } from "api/apiRequest";

export async function submitProcessCsvImport(
  storeId: string,
  blobName: string,
  staffId: string
) {
  return postWithExceptions(
    "/CommerceHub/CustomCatalogs/ProcessCustomCatalogCsv",
    {
      param: {
        store_id: storeId,
        blob_name: blobName,
        sleekflow_staff_id: staffId,
        sleekflow_staff_team_ids: null,
      },
    }
  );
}
