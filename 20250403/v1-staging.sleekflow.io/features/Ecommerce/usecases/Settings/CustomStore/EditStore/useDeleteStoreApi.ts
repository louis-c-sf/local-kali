import { useState } from "react";
import { submitDeleteStore } from "api/CommerceHub/submitDeleteStore";

export function useDeleteStoreApi(
  id: string | undefined,
  onDeleted: () => void
) {
  const [isRunning, setIsRunning] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  function start() {
    setConfirmVisible(true);
  }

  function cancel() {
    setConfirmVisible(false);
  }

  async function execute() {
    if (!id) {
      return;
    }
    setIsRunning(true);
    try {
      await submitDeleteStore(id);
      onDeleted();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  }

  return {
    start,
    cancel,
    execute,
    confirmVisible,
    isRunning,
  };
}
