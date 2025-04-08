import { CaptureOptions, Properties } from 'posthog-js';
import { usePostHog } from 'posthog-js/react';
import {
  AllPosthogEvents,
  ExtractPosthogEventProperties,
} from '@/posthog/_generated/events';

export function useTypedPosthog() {
  // spread operator does not work here! Have to .bind fns or put into lambdas
  const posthog = usePostHog();

  return {
    capture: <TEvent extends AllPosthogEvents>(
      event_name: TEvent,
      properties: ExtractPosthogEventProperties<TEvent>,
      options?: CaptureOptions,
    ) => {
      posthog.capture(event_name, properties, options);
    },
    identify: (
      new_distinct_id?: string | undefined,
      userPropertiesToSet?: Properties | undefined,
      userPropertiesToSetOnce?: Properties | undefined,
    ) => {
      posthog.identify(
        new_distinct_id,
        userPropertiesToSet,
        userPropertiesToSetOnce,
      );
    },
    group: posthog.group.bind(posthog),
    on: posthog.on.bind(posthog),
    getActiveMatchingSurveys: posthog.getActiveMatchingSurveys.bind(posthog),
    getSurveys: posthog.getSurveys.bind(posthog),
    updateEarlyAccessFeatureEnrollment:
      posthog.updateEarlyAccessFeatureEnrollment.bind(posthog),
    // updateEarlyAccessFeatureEnrollment: (
    //   betaKey: NonNullable<EarlyAccessFeature['flagKey']>,
    //   active: boolean,
    // ) => {
    //   return posthog.updateEarlyAccessFeatureEnrollment(betaKey, active);
    // },
    getEarlyAccessFeatures: posthog.getEarlyAccessFeatures.bind(posthog),
    // getEarlyAccessFeatures: (
    //   callback: (earlyAccessFeatures: EarlyAccessFeature[]) => void,
    //   force_reload?: boolean,
    // ) => {
    //   // @ts-expect-error types from api
    //   return posthog.getEarlyAccessFeatures(callback, force_reload);
    // },
    reset: posthog.reset.bind(posthog),
  };
}
