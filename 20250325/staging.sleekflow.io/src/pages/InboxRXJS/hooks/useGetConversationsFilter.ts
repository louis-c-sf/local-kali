import {
  NavigateOptions,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import * as yup from 'yup';

import { useMyProfile } from '@/hooks/useMyProfile';
import { ConversationSummaryStatus } from '@/services/conversations/models/conversation-summary';
import type { GetConversationsFilter } from '@/services/conversations/models/get-conversations-filter';
import { tryEncodeURL, tryParseEncodedURL } from '@/utils/url';

export const DEFAULT_CONVERSATION_FILTER = {
  status: 'open',
  isStaffAssigned: true,
};

export const getDefaultConversationFilter: (data: {
  myUserProfileId: string | undefined;
}) => GetConversationsFilter = (data) => ({
  ...DEFAULT_CONVERSATION_FILTER,
  assignedStaffId: data.myUserProfileId,
});

export const getConversationFilterSchema = yup.object().shape({
  assignedStaffId: yup.string(),
  isStaffAssigned: yup.boolean(),
  assignedTeamId: yup.number(),
  isTeamUnassigned: yup.boolean(),
  status: yup.mixed().oneOf(ConversationSummaryStatus),
  channelIds: yup.array().of(yup.string()),
  labelIds: yup.array().of(yup.string()),

  isUnread: yup.boolean().optional(),
  isCollaborated: yup.boolean(),
  isMentioned: yup.boolean(),

  orderBy: yup.string(),
  channelType: yup.string(),
});

export const validateGetConversationFilter = (data: unknown) => {
  try {
    return getConversationFilterSchema.validateSync(data, {
      stripUnknown: true,
    }) as GetConversationsFilter;
  } catch (_e) {
    return null;
  }
};

export const useGetConversationsFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  if (!location.pathname.includes('inbox')) {
    throw new Error('hook can only be used in inbox page');
  }
  const parsedConversationFilters = tryParseEncodedURL(
    searchParams.get('getConversationsFilter'),
  );
  const myUserProfile = useMyProfile();
  const currentGetConversationFilter =
    validateGetConversationFilter(parsedConversationFilters) ??
    (getDefaultConversationFilter({
      myUserProfileId: myUserProfile?.data?.userInfo.id,
    }) as GetConversationsFilter);

  return {
    searchKeyword: searchParams.get('searchKeyword') ?? '',
    setSearchKeyword: (keyword: string, options?: NavigateOptions) => {
      if (keyword === '') {
        setSearchParams((prev) => {
          prev.delete('searchKeyword');
          return prev;
        }, options);
        return;
      }
      setSearchParams((prev) => {
        return {
          ...[...prev.entries()].reduce(
            (acc, [key, value]) => {
              acc[key] = value;
              return acc;
            },
            {} as Record<string, string>,
          ),
          searchKeyword: keyword,
        };
      }, options);
    },
    getConversationsFilter: currentGetConversationFilter,
    setGetConversationsFilter: (
      filter: GetConversationsFilter,
      options?: {
        discardPreviousValues?: boolean;
        navigateOptions?: NavigateOptions;
      },
    ) => {
      setSearchParams((prev) => {
        prev.set(
          'getConversationsFilter',
          tryEncodeURL({
            ...(options?.discardPreviousValues
              ? {}
              : currentGetConversationFilter),
            ...filter,
          }),
        );
        return prev;
      }, options?.navigateOptions);
    },
    deleteGetConversationsFilter: () => {
      setSearchParams((prev) => {
        prev.delete('getConversationsFilter');
        return prev;
      });
    },
  };
};
