import * as yup from 'yup';

import { Hashtag, Linguals } from '@/api/types';
import type { BriefUserProfileList } from '@/api/userProfile';
import { AVAILABLE_LANGUAGES } from '@/constants/i18n';
import { ArrayElement } from '@/utils/ts-utils';

export const transformedLingualsSchema = yup
  .object({
    ...AVAILABLE_LANGUAGES.reduce<yup.ObjectShape>((acc, nextVal) => {
      acc[nextVal] = yup.string().nullable();
      return acc;
    }, {}),
  })
  .noUnknown();

export const isTransformedLinguagls = (
  elem: unknown,
): elem is TransformedLinguals => {
  return transformedLingualsSchema.isValidSync(elem, { stripUnknown: false });
};

export type TransformedLinguals = Partial<Record<Linguals['language'], string>>;

export type TransformedUserProfileOptions =
  | Record<string, ArrayElement<BriefUserProfileList['userGroups']>>
  | Record<string, TransformedLinguals>
  | Record<string, Hashtag>;
