import { ChatGuard } from "../../../Settings/helpers/ChatGuard";
import { useAppSelector } from "../../../../AppRootContext";

export function useChatGuard() {
  const state = useAppSelector((s) => s.inbox.pickingMessages);
  return new ChatGuard(state);
}
