import { useState } from "react";
import { submitProcessCsvImport } from "api/CommerceHub/submitProcessCsvImport";
import { useAppSelector } from "AppRootContext";
import { useUploadCommerceHubBlob } from "features/Ecommerce/components/useUploadCommerceHubBlob";

export function useImportProductsFromCsv(props: {
  storeId: string;
  onFinish: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [strategy, setStrategy] = useState<"append" | "update">("append");
  const [loading, setLoading] = useState(false);
  const staffId = useAppSelector((s) => s.loggedInUserDetail?.staffId);

  const uploadBlob = useUploadCommerceHubBlob("File");

  async function execute() {
    setLoading(true);
    try {
      if (!file) {
        throw "No file provided";
      }
      if (!staffId) {
        throw "No staff id";
      }
      const blobName = await uploadBlob.upload(file, props.storeId);
      await submitProcessCsvImport(props.storeId, blobName, String(staffId));
      props.onFinish();
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      setLoading(false);
    }
  }

  return {
    strategy,
    toggleStrategy: () => {
      //todo will be enabled after BE fix
      setStrategy((s) => (s === "update" ? "append" : "update"));
    },
    file,
    setFile,
    loading,
    execute,
  };
}
