import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_TOKEN, {
  enable_heatmaps: true,
  api_host: 'https://eu.i.posthog.com',
  person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
  session_recording: {
    maskAllInputs: false,
  },
  advanced_disable_feature_flags_on_first_load: true,
  autocapture: false,
});

export default posthog;
