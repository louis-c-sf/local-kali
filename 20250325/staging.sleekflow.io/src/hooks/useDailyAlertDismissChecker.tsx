import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';

const DEFAULT_TIMESTAMP = '';

/**
 * Custom hook to handle daily alert dismissal state
 * Tracks if an alert should be shown based on whether it was dismissed today
 * @param storageKey - Base key for localStorage
 */
const useDailyAlertDismissChecker = (storageKey: string) => {
  /**
   * Retrieves the stored dismiss timestamp from localStorage
   */
  const getDismissFromStorage = useCallback((key: string): string => {
    if (!key) return DEFAULT_TIMESTAMP;

    const storedValue = localStorage.getItem(key);

    return storedValue ?? DEFAULT_TIMESTAMP;
  }, []);

  const isMoreThan24HoursAgo = useCallback((timestamp: string) => {
    if (!timestamp) return true;
    const dismissTime = dayjs.utc(timestamp);
    return dayjs.utc().isAfter(dayjs(dismissTime).add(1, 'day'));
  }, []);

  // Initialize state with proper value from localStorage
  const [dismissTimestamp, setDismissTimestamp] = useState(() => {
    const storedTimestamp = getDismissFromStorage(storageKey);

    if (isMoreThan24HoursAgo(storedTimestamp)) {
      localStorage.removeItem(storageKey);
      return DEFAULT_TIMESTAMP;
    }
    return storedTimestamp;
  });
  /**
   * Handler for dismissing the alert, sets the current timestamp
   */
  const handleDismiss = useCallback(() => {
    if (!storageKey) return;
    const now = dayjs.utc().toISOString();
    setDismissTimestamp(now);
    localStorage.setItem(storageKey, now);
  }, [storageKey]);

  // Sync state with localStorage and handle expiration
  useEffect(() => {
    if (!storageKey) return;

    const storedTimestamp = getDismissFromStorage(storageKey);

    if (isMoreThan24HoursAgo(storedTimestamp)) {
      setDismissTimestamp(DEFAULT_TIMESTAMP);
      localStorage.removeItem(storageKey);
    } else {
      setDismissTimestamp(storedTimestamp);
    }
  }, [storageKey, getDismissFromStorage, isMoreThan24HoursAgo]);

  return {
    showAlert: isMoreThan24HoursAgo(dismissTimestamp),
    handleDismiss,
  };
};

export default useDailyAlertDismissChecker;
