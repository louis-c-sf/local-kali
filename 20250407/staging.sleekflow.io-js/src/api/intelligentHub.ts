import { BlockBlobClient } from '@azure/storage-blob';
import { createQueryKeys } from '@lukemorales/query-key-factory';
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { useAxios } from '@/api/axiosClient';
import { PAGE_STORAGE_LIMIT } from '@/pages/AiSettings/constants';

export const TextRephraseMethodologies = {
  Expand: 'Lengthen',
  Shorten: 'Shorten',
  GrammarCheck: 'GrammarCheck',
  Simplify: 'Simplify',
  Numeric: 'Enumerate',
  Bulletize: 'Bulletize',
} as const;

export const TextTranslateMethodologies = {
  English: 'en',
  Cantonese: 'yue',
  TraditionalChineseTaiwan: 'zh-TW',
  SimplifiedChinese: 'zh-CN',
  Bahasa: 'ms',
  Portuguese: 'pt',
  Spanish: 'es',
  Indonesian: 'id',
  Arabic: 'ar',
} as const;

export const TextChangeToneMethodologies = {
  Professional: 'Professional',
  Friendly: 'Friendly',
  Empathetic: 'Empathetic',
  Authoritative: 'Authoritative',
  Urgent: 'Urgent',
  Instructional: 'Instructional',
} as const;

type TextRephraseMethodologiesType =
  (typeof TextRephraseMethodologies)[keyof typeof TextRephraseMethodologies];
type TextTranslateMethodologiesType =
  (typeof TextTranslateMethodologies)[keyof typeof TextTranslateMethodologies];
type TextChangeToneMethodologiesType =
  (typeof TextChangeToneMethodologies)[keyof typeof TextChangeToneMethodologies];

export type EnrichmentRephraseParamsType = {
  message: string;
  rephrase_target_type: TextRephraseMethodologiesType;
};

export type EnrichmentTranslateParamsType = {
  message: string;
  target_language_code: TextTranslateMethodologiesType;
};

export type EnrichmentChangeToneParamsType = {
  message: string;
  tone_type: TextChangeToneMethodologiesType;
};

export const intelligentHubKeys = createQueryKeys('intelligentHub', {
  getFeatureUsageStatistics: null,
  getConfig: null,
  getKnowledgeBaseEntries: (params: GetKnowledgeBaseEntriesParams) => [
    { ...params },
  ],
  getKnowledgeBaseEntry: (id: string) => [id],
  getFileDocumentChunks: (params: GetFileDocumentChunksParams) => [
    { ...params },
  ],
  getProcessFileDocumentStatus: (params: { documentId: string }) => [
    { ...params },
  ],
  calculateRemainingPages: null,
  getSettings: null,
  getFileDocChunkIds: (params: { company_id: string; document_id: string }) => [
    { ...params },
  ],
  getFileDocList: null,
  getKnowledgeBaseUploadHistory: (params: {
    companyId: string;
    blobId: string;
  }) => [{ ...params }],
});

type CreateBlobUploadSasUrlsResponse = {
  download_blobs: {
    // FIXME: Wait backend to fix the response
    container_name: null | string;
    blob_name: string;
    blob_id: string;
    url: string;
    expires_on: string;
    content_type: string;
  }[];
};

type CreateBlobDownloadSasUrlResponse = {
  download_blobs: {
    container_name: string;
    blob_name: string;
    blob_id: string;
    url: string;
    expires_on: string;
    content_type: string;
  }[];
};

export const useKnowledgeBaseFileDownloadMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      companyId,
      blobName,
      blobType,
    }: {
      companyId: string;
      blobName: string;
      blobType: string;
    }) => {
      const response = await axiosClient.post<CreateBlobDownloadSasUrlResponse>(
        '/IntelligentHub/Blobs/CreateBlobDownloadSasUrls',
        {
          sleekflow_company_id: companyId,
          blob_names: [blobName],
          blob_type: blobType,
        },
      );
      return response.data;
    },
  });
};

export const useKnowledgeBaseFileUploadHistoryQuery = ({
  companyId,
  blobId,
  enabled,
}: {
  companyId: string;
  blobId: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: intelligentHubKeys.getKnowledgeBaseUploadHistory({
      companyId,
      blobId,
    }),
    queryFn: async () => {
      const response = await axiosClient.post(
        '/IntelligentHub/Blobs/GetBlobUploadHistory',
        {
          sleekflow_company_id: companyId,
          blob_id: blobId,
        },
      );
      return response.data;
    },
    enabled,
  });
};

export const useKnowledgeBaseFileUpload = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      companyId,
      file,
    }: {
      companyId: string;
      file: File;
    }) => {
      const createBlobUploadUrlResponse =
        await axiosClient.post<CreateBlobUploadSasUrlsResponse>(
          '/IntelligentHub/Blobs/CreateBlobUploadSasUrls',
          {
            number_of_blobs: 1,
            blob_type: 'File',
            sleekflow_company_id: companyId,
          },
        );
      const uploadUrl = createBlobUploadUrlResponse.data;

      const firstBlob = uploadUrl?.download_blobs[0];

      const serviceClient = new BlockBlobClient(firstBlob.url);
      await serviceClient.uploadData(file);

      const createBlobDownloadUrlResponse =
        await axiosClient.post<CreateBlobDownloadSasUrlResponse>(
          '/IntelligentHub/Blobs/CreateBlobDownloadSasUrls',
          {
            sleekflow_company_id: companyId,
            blob_names: [firstBlob.blob_name],
            blob_type: 'File',
          },
        );

      return createBlobDownloadUrlResponse.data?.download_blobs[0];
    },
  });
};

interface DeleteKnowledgeBaseBlobParams {
  sleekflow_company_id: string;
  blob_names: string[];
  blob_type: string;
}

export const useDeleteKnowledgeBaseBlobMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      sleekflow_company_id,
      blob_type,
      blob_names,
    }: DeleteKnowledgeBaseBlobParams) => {
      const response = await axiosClient.post(
        '/IntelligentHub/Blobs/DeleteBlobs',
        {
          sleekflow_company_id: sleekflow_company_id,
          blob_type,
          blob_names,
        },
      );
      return response.data;
    },
  });
};

interface GetKnowledgeBaseEntriesParams {
  companyId: string;
  filter?: { source_id: string; source_type: string };
  limit: number;
  cursor?: string;
}

interface CalculateFileDocumentStatsParams {
  blob_id: string;
  sleekflow_company_id: string;
  blob_type: string;
}

interface DocumentStatistics {
  total_token_counts: number;
  total_word_counts: number;
  total_characters: number;
  total_pages: number;
}

export const useCalculateFileDocumentStatsMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (body: CalculateFileDocumentStatsParams) => {
      const response = await axiosClient.post<{
        document_statistics: DocumentStatistics;
      }>('/IntelligentHub/Documents/CalculateFileDocumentStatistics', body);
      return response.data;
    },
  });
};

export const FILE_DOCUMENT_WORKER_OPERATIONS = {
  splitIntoPages: 'SplitIntoPages',
  splitIntoChunks: 'SplitIntoChunks',
  transformTableToText: 'TransformTableToText',
  traCategorize: 'TraCategorize',
  translate: 'Translate',
} as const;

interface StartFileDocumentWorkerParams {
  sleekflow_company_id: string;
  blob_id: string;
  blob_type: string;
  document_id: string;
  operations: (typeof FILE_DOCUMENT_WORKER_OPERATIONS)[keyof typeof FILE_DOCUMENT_WORKER_OPERATIONS][];
}

export const useStartFileDocumentWorkerAutoLoadMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (body: StartFileDocumentWorkerParams) => {
      const resp = await axiosClient.post(
        '/IntelligentHub/Documents/StartFileDocumentWorkerAutoLoad',
        body,
      );
      return resp.data;
    },
  });
};

interface GetFileDocumentChunksParams {
  company_id: string;
  limit: number;
  document_id: string;
  continuation_token?: string;
}

interface ProcessFileDocumentStatusResponse {
  document_id: string;
  file_document_process_status: string;
}

export const useGetProcessFileDocumentStatusQueries = ({
  companyId,
  documentIds,
  enabled,
}: {
  companyId: string;
  documentIds: string[];
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQueries({
    queries: documentIds.map<
      UseQueryOptions<ProcessFileDocumentStatusResponse>
    >((documentId) => {
      return {
        queryKey: intelligentHubKeys.getProcessFileDocumentStatus({
          documentId,
        }),
        queryFn: async ({ signal }) => {
          const response =
            await axiosClient.post<ProcessFileDocumentStatusResponse>(
              '/IntelligentHub/Documents/GetProcessFileDocumentStatus',
              {
                sleekflow_company_id: companyId,
                document_id: documentId,
              },
              {
                signal,
              },
            );
          return response.data;
        },
        refetchInterval: (query) => {
          if (query.state.error) return false;
          if (
            query.state.data?.file_document_process_status === 'processing' ||
            query.state.data?.file_document_process_status === 'pending'
          )
            return 1000 * 10; // 10 seconds
          return false;
        },
        enabled,
      };
    }),
  });
};

export const useGetProcessFileDocumentStatusMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      documentId,
      companyId,
    }: {
      documentId: string;
      companyId: string;
    }) => {
      const response =
        await axiosClient.post<ProcessFileDocumentStatusResponse>(
          '/IntelligentHub/Documents/GetProcessFileDocumentStatus',
          {
            sleekflow_company_id: companyId,
            document_id: documentId,
          },
        );
      return response.data;
    },
  });
};

interface GetFileDocumentInfoParams {
  sleekflow_company_id: string;
  blob_ids: string[];
}

interface GetFileDocumentInfoResponse {
  document: {
    sleekflow_company_id: string;
    document_statistics: DocumentStatistics;
    created_at: string;
    updated_at: string;
    id: string;
    sys_type_name: string;
  };
}

export const useGetFileDocumentInfoMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async (body: GetFileDocumentInfoParams) => {
      const promises = body.blob_ids.map((blobId) => {
        return axiosClient.post<GetFileDocumentInfoResponse>(
          '/IntelligentHub/Documents/GetFileDocumentInformation',
          {
            sleekflow_company_id: body.sleekflow_company_id,
            blob_id: blobId,
          },
        );
      });

      const responses = await Promise.all(promises);

      return responses.map((response) => response.data);
    },
  });
};

interface CalculateRemainingPagesResponse {
  sleekflow_company_id: string;
  page_limit: number;
  current_usage: number;
  remaining_page: number;
}

export const useCalculateRemainingPagesQuery = <
  T = CalculateRemainingPagesResponse,
>({
  companyId,
  select,
  enabled,
}: {
  companyId: string;
  select?: (data: CalculateRemainingPagesResponse) => T;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: intelligentHubKeys.calculateRemainingPages,
    queryFn: async ({ signal }) => {
      const response = await axiosClient.post<CalculateRemainingPagesResponse>(
        '/IntelligentHub/Documents/CalculateRemainingPages',
        {
          sleekflow_company_id: companyId,
          page_limit: PAGE_STORAGE_LIMIT,
        },
        { signal },
      );
      return response.data;
    },
    select,
    enabled,
  });
};

interface FileDocInfo {
  file_name: string;
  blob_id: string;
  document_id: string;
  pages: number;
  training_status: string;
  upload_date: string;
  uploaded_by: string;
  last_updated: string;
}

export interface GetFileDocListResponse {
  file_document_infos: FileDocInfo[];
}

export const useGetFileDocListQuery = <T = GetFileDocListResponse>({
  companyId,
  enabled,
  select,
  throwOnError,
}: {
  companyId: string;
  enabled?: boolean;
  select?: (data: GetFileDocListResponse) => T;
  throwOnError?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: intelligentHubKeys.getFileDocList,
    queryFn: async ({ signal }) => {
      const response = await axiosClient.post<GetFileDocListResponse>(
        '/IntelligentHub/Documents/GetFileDocumentList',
        {
          sleekflow_company_id: companyId,
        },
        {
          signal,
        },
      );
      return response.data;
    },
    enabled,
    select,
    throwOnError: throwOnError,
  });
};

export const useRecordBlobUploadHistoryMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      companyId,
      blobId,
      fileName,
      uploadedBy,
      blobType,
      sourceType = 'file_document',
    }: {
      companyId: string;
      blobId: string;
      fileName: string;
      uploadedBy: string;
      blobType: string;
      sourceType?: string;
    }) => {
      const response = await axiosClient.post(
        '/IntelligentHub/Blobs/RecordBlobUploadHistory',
        {
          sleekflow_company_id: companyId,
          blob_id: blobId,
          uploaded_by: uploadedBy,
          source_type: sourceType,
          blob_type: blobType,
          file_name: fileName,
        },
      );
      return response.data;
    },
  });
};

interface CreateFileDocResponse {
  file_document: {
    blob_id: string;
    file_name: string;
    uploaded_by: string;
    blob_type: string;
    content_type: string;
    language_iso_code: string;
    metadata: {
      additionalProp1: string;
      additionalProp2: string;
      additionalProp3: string;
    };
    file_document_process_status: string;
    sleekflow_company_id: string;
    document_statistics: {
      total_token_counts: number;
      total_word_counts: number;
      total_characters: number;
      total_pages: number;
    };
    created_at: string;
    updated_at: string;
    id: string;
    sys_type_name: string;
    ttl: number;
  };
}

export const useCreateFileDocumentMutation = () => {
  const axiosClient = useAxios();
  return useMutation({
    mutationFn: async ({
      companyId,
      blobId,
      blobType,
    }: {
      companyId: string;
      blobId: string;
      blobType: string;
    }) => {
      const response = await axiosClient.post<CreateFileDocResponse>(
        '/IntelligentHub/Documents/CreateFileDocument',
        {
          sleekflow_company_id: companyId,
          blob_id: blobId,
          blob_type: blobType,
        },
      );
      return response.data;
    },
  });
};

export const useGetFileDocumentChunkIdsQuery = ({
  companyId,
  documentId,
  enabled,
}: {
  companyId: string;
  documentId: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: intelligentHubKeys.getFileDocChunkIds({
      company_id: companyId,
      document_id: documentId,
    }),
    queryFn: async () => {
      const response = await axiosClient.post<{ chunk_ids: string[] }>(
        '/IntelligentHub/Documents/GetFileDocumentChunkIds',
        {
          company_id: companyId,
          document_id: documentId,
        },
      );
      return response.data;
    },
    enabled,
  });
};

interface GetAISettingsResponse {
  enable_writing_assistant: boolean;
  enable_smart_reply: boolean;
}

export const useGetAISettingsQuery = ({
  companyId,
  enabled,
}: {
  companyId: string;
  enabled?: boolean;
}) => {
  const axiosClient = useAxios();
  return useQuery({
    queryKey: intelligentHubKeys.getSettings,
    queryFn: async ({ signal }) => {
      const response = await axiosClient.post<GetAISettingsResponse>(
        '/IntelligentHub/IntelligentHubConfigs/GetAiFeatureSetting',

        {
          sleekflow_company_id: companyId,
        },
        {
          signal,
        },
      );
      return response.data;
    },
    enabled,
  });
};

export const useUpdateAISettingsMutation = () => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      companyId,
      enable_writing_assistant,
      enable_smart_reply,
    }: {
      companyId: string;
      enable_writing_assistant: boolean;
      enable_smart_reply: boolean;
    }) => {
      const response = await axiosClient.post<GetAISettingsResponse>(
        '/IntelligentHub/IntelligentHubConfigs/UpdateAiFeatureSetting',
        {
          sleekflow_company_id: companyId,
          enable_writing_assistant,
          enable_smart_reply,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: intelligentHubKeys.getSettings,
      });
    },
  });
};

export const useDeleteFileDocumentMutation = () => {
  const axiosClient = useAxios();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      companyId,
      documentId,
      blobId,
    }: {
      companyId: string;
      documentId: string;
      blobId: string;
    }) => {
      const response = await axiosClient.post(
        '/IntelligentHub/Documents/DeleteFileDocument',
        {
          sleekflow_company_id: companyId,
          blob_id: blobId,
          document_id: documentId,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: intelligentHubKeys.getFileDocList,
      });
    },
  });
};
