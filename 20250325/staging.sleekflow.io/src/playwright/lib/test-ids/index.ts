import { COMMON_TEST_IDS } from '@/playwright/lib/test-ids/common';
import { INBOX_TEST_IDS } from '@/playwright/lib/test-ids/inbox';
import { CHANNELS_TEST_IDS } from '@/playwright/lib/test-ids/channels';
import { FLOWBUILDER_TEST_IDS } from '@/playwright/lib/test-ids/flow-builder';
import { CONTACTS_TEST_IDS } from '@/playwright/lib/test-ids/contacts';
import { SETTINGS_TEST_IDS } from '@/playwright/lib/test-ids/settings';
import { TICKETING_TEST_IDS } from '@/playwright/lib/test-ids/ticketing';
import { BROADCAST_TEST_IDS } from '@/playwright/lib/test-ids/broadcast';
import { AI_SETTINGS_TEST_IDS } from '@/playwright/lib/test-ids/ai-settings';

/**
 * Test ids follow the structure {module}-{what}-{elementType}
 * eg. inbox-add-collaborators-menu-trigger, settings-add-profile-picture-button
 * */
export const testIds = {
  ...COMMON_TEST_IDS,
  ...INBOX_TEST_IDS,
  ...CHANNELS_TEST_IDS,
  ...FLOWBUILDER_TEST_IDS,
  ...CONTACTS_TEST_IDS,
  ...SETTINGS_TEST_IDS,
  ...TICKETING_TEST_IDS,
  ...BROADCAST_TEST_IDS,
  ...AI_SETTINGS_TEST_IDS,
} as const;
