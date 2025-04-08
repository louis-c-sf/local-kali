import { create } from 'zustand';

const DEBUG_LOCAL_STORAGE_KEY = 'debugMode';

export const getDebugModeFromLocalStorage = () =>
  window.localStorage.getItem(DEBUG_LOCAL_STORAGE_KEY) === 'true';

export const useDebugMode = create<{
  debugMode: boolean;
  toggleDebugValue: () => void;
}>((setState) => {
  const debugModeFromLocalStorage = getDebugModeFromLocalStorage();

  const initialDebugMode =
    import.meta.env.VITE_USER_NODE_ENV !== 'production'
      ? debugModeFromLocalStorage
      : false;

  return {
    debugMode: initialDebugMode,
    toggleDebugValue: () => {
      if (import.meta.env.VITE_USER_NODE_ENV === 'production') {
        return;
      }

      setState((prev) => {
        window.localStorage.setItem(
          DEBUG_LOCAL_STORAGE_KEY,
          String(!prev.debugMode),
        );

        return {
          ...prev,
          debugMode: !prev.debugMode,
        };
      });
    },
  };
});
