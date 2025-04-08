import { AVAILABLE_LANGUAGES } from '@/constants/i18n';

export const v1LanguageMap = {
  'zh-HK': 'zh-HK',
  'zh-CN': 'zh-CN',
  'pt-BR': 'pt-BR',
  en: 'en-US',
  id: 'id-ID',
} as const;

export const marketingLanguageMap = {
  'zh-HK': 'zh-hk',
  'zh-CN': 'zh-cn',
  'pt-BR': 'pt-br',
  en: '',
  id: 'id-id',
};

const BACK_FROM_V2 = 'back_from_v2=true';

export const generateV1RedirectionLink = ({ path }: { path: string }) => {
  switch (import.meta.env.VITE_USER_NODE_ENV) {
    case 'uat':
      return `https://v1-dev.sleekflow.io${path}?${BACK_FROM_V2}`;
    case 'staging':
      return `https://v1-staging.sleekflow.io${path}?${BACK_FROM_V2}`;
    case 'production':
    default:
      return `https://v1.sleekflow.io${path}?${BACK_FROM_V2}`;
  }
};

export function generateMarketingWebsiteURL(params: {
  paths: Omit<
    { [key in (typeof AVAILABLE_LANGUAGES)[number]]?: string },
    'en'
  > & {
    en: string;
  };
  language: string;
}): string;
export function generateMarketingWebsiteURL(params: {
  path: string;
  language: string;
}): string;
export function generateMarketingWebsiteURL({
  paths,
  language,
  path,
}: {
  path?: string;
  paths?: Omit<
    { [key in (typeof AVAILABLE_LANGUAGES)[number]]?: string },
    'en'
  > & {
    en: string;
  };

  language: string;
}) {
  if (path) {
    return `https://sleekflow.io${
      language in marketingLanguageMap
        ? marketingLanguageMap[language as keyof typeof marketingLanguageMap]
        : ''
    }${path}`;
  }

  if (paths) {
    return `https://sleekflow.io${
      paths[language as keyof typeof paths] || paths.en
    }`;
  }
}
