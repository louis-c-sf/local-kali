import { parsePhoneNumberWithError } from 'libphonenumber-js';

export const parsePhoneNumber = (
  ...params: Parameters<typeof parsePhoneNumberWithError>
) => {
  try {
    const parsed = parsePhoneNumberWithError(...params);
    return [parsed, null] as const;
  } catch (e) {
    return [null, e] as const;
  }
};
