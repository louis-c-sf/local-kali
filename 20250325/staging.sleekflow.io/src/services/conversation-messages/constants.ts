export const CHECKSUM_FALLBACK = 'no-checksum';
export const ID_FALLBACK = 'no-id';
export const NO_DEFAULT_MESSAGE_ID = 'no-default-id' as const;
export const NO_TIMESTAMP = 'no-timestamp' as const;
export const START_OF_CONVERSATION = 'start' as const;
export const END_OF_CONVERSATION = 'end' as const;
export const DELIMITER = '___';
export type Delimiter = typeof DELIMITER;
