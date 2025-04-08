import { useInjection } from 'inversify-react';
import { useCallback, useEffect } from 'react';

import { ClassicRealTimeService } from '@/services/signal-r/classic-real-time.service';
import { STANDARD_SIGNALR_EVENTS } from '@/signalr/constants';

const isNumString = (str: string): boolean => !isNaN(Number(str));

// From https://github.com/sibu-github/deep-parse-json
function deepParseJson(jsonString: any): any {
  // if not stringified json rather a simple string value then JSON.parse will throw error
  // otherwise continue recursion
  if (typeof jsonString === 'string') {
    if (isNumString(jsonString)) {
      // if a numeric string is received, return itself
      // otherwise JSON.parse will convert it to a number
      return jsonString;
    }
    try {
      return deepParseJson(JSON.parse(jsonString));
    } catch (_err) {
      return jsonString;
    }
  } else if (Array.isArray(jsonString)) {
    // if an array is received, map over the array and deepParse each value
    return jsonString.map((val: any) => deepParseJson(val));
  } else if (typeof jsonString === 'object' && jsonString !== null) {
    // if an object is received then deepParse each element in the object
    // typeof null returns 'object' too, so we have to eliminate that
    return Object.keys(jsonString).reduce(
      (obj: Record<string, any>, key: string) => {
        const val = jsonString[key];
        obj[key] = deepParseJson(val);
        return obj;
      },
      Object.create(null),
    );
  } else {
    // otherwise return whatever was received
    return jsonString;
  }
}

// Custom hooks
const useSignalREffect = (
  eventName: string,
  callback: (...args: any[]) => void,
  deps: any[] = [],
) => {
  const classicRealTimeService = useInjection<ClassicRealTimeService>(
    ClassicRealTimeService,
  );
  const _callback = useCallback((...args: any[]) => {
    args[2] ? callback(deepParseJson(args[2])) : callback(...args);
  }, deps);

  useEffect(() => {
    if (eventName === STANDARD_SIGNALR_EVENTS.onBackgroundTaskStatusChange) {
      const subscription = classicRealTimeService
        .getOnBackgroundTaskStatusChange$()
        .subscribe(_callback);

      return () => subscription.unsubscribe();
    }

    console.error('Event name not found in useSignalREffect', eventName);

    return () => {
      // Do nothing
    };
  }, [classicRealTimeService, eventName, _callback]);
};

export default useSignalREffect;
