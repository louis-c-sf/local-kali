import { downloadFileViaGet } from "../apiRequest";

export async function fetchProductImportTemplate() {
  return await downloadFileViaGet(
    "/CommerceHub/CustomCatalogs/GetCsvTemplateSample",
    "product_import_template.csv",
    "text/csv"
  );
}
