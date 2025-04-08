import { useAppSelector } from "../../../AppRootContext";

export function useChatControls() {
  const allowSwitchConversation = useAppSelector(
    (s) => s.inbox.allowSwitchConversation
  );

  function whenUIUnlocked(wrapped: Function) {
    return function(...args: any[]) {
      if (!allowSwitchConversation) {
        return;
      }
      return wrapped.apply(wrapped, args);
    };
  }

  return { whenUIUnlocked };
}
