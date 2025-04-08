import { a as axios } from './index-b5781c88.js';
import { H as HttpMiddlewareService, E as EventTypes } from './axios-middleware.esm-b5e3eb44.js';
import { c as collection } from './collection-89937abc.js';
import { e as eventBus } from './event-bus-be6948e5.js';
import { g as getVersionOptionsString } from './domain-a7b2c384.js';

let _httpClient = null;
let _elsaClient = null;
const createHttpClient = async function (baseAddress) {
  if (!!_httpClient)
    return _httpClient;
  const config = {
    baseURL: baseAddress
  };
  _httpClient = axios.create(config);
  const service = new HttpMiddlewareService(_httpClient);
  await eventBus.emit(EventTypes.HttpClientConfigCreated, this, { config });
  await eventBus.emit(EventTypes.HttpClientCreated, this, { service, _httpClient });
  return _httpClient;
};
const createElsaClient = async function (serverUrl) {
  if (!!_elsaClient)
    return _elsaClient;
  const httpClient = await createHttpClient(serverUrl);
  _elsaClient = {
    activitiesApi: {
      list: async () => {
        const response = await httpClient.get('v1/activities');
        return response.data;
      }
    },
    workflowDefinitionsApi: {
      list: async (page, pageSize, versionOptions) => {
        const queryString = {
          version: getVersionOptionsString(versionOptions)
        };
        if (!!page || page === 0)
          queryString['page'] = page;
        if (!!pageSize)
          queryString['pageSize'] = pageSize;
        const queryStringItems = collection.map(queryString, (v, k) => `${k}=${v}`);
        const queryStringText = queryStringItems.length > 0 ? `?${queryStringItems.join('&')}` : '';
        const response = await httpClient.get(`v1/workflow-definitions${queryStringText}`);
        return response.data;
      },
      getMany: async (ids, versionOptions) => {
        const versionOptionsString = getVersionOptionsString(versionOptions);
        const response = await httpClient.get(`v1/workflow-definitions?ids=${ids.join(',')}&version=${versionOptionsString}`);
        return response.data.items;
      },
      getVersionHistory: async (definitionId) => {
        const response = await httpClient.get(`v1/workflow-definitions/${definitionId}/history`);
        return response.data.items;
      },
      getByDefinitionAndVersion: async (definitionId, versionOptions) => {
        const versionOptionsString = getVersionOptionsString(versionOptions);
        const response = await httpClient.get(`v1/workflow-definitions/${definitionId}/${versionOptionsString}`);
        return response.data;
      },
      save: async (request) => {
        const response = await httpClient.post('v1/workflow-definitions', request);
        return response.data;
      },
      delete: async (definitionId, versionOptions) => {
        let path = `v1/workflow-definitions/${definitionId}`;
        if (!!versionOptions) {
          const versionOptionsString = getVersionOptionsString(versionOptions);
          path = `${path}/${versionOptionsString}`;
        }
        await httpClient.delete(path);
      },
      retract: async (workflowDefinitionId) => {
        const response = await httpClient.post(`v1/workflow-definitions/${workflowDefinitionId}/retract`);
        return response.data;
      },
      publish: async (workflowDefinitionId) => {
        const response = await httpClient.post(`v1/workflow-definitions/${workflowDefinitionId}/publish`);
        return response.data;
      },
      revert: async (workflowDefinitionId, version) => {
        const response = await httpClient.post(`v1/workflow-definitions/${workflowDefinitionId}/revert/${version}`);
        return response.data;
      },
      export: async (workflowDefinitionId, versionOptions) => {
        const versionOptionsString = getVersionOptionsString(versionOptions);
        const response = await httpClient.post(`v1/workflow-definitions/${workflowDefinitionId}/${versionOptionsString}/export`, null, {
          responseType: 'blob'
        });
        const contentDispositionHeader = response.headers["content-disposition"]; // Only available if the Elsa Server exposes the "Content-Disposition" header.
        const fileName = contentDispositionHeader ? contentDispositionHeader.split(";")[1].split("=")[1] : `workflow-definition-${workflowDefinitionId}.json`;
        const data = response.data;
        return {
          fileName: fileName,
          data: data
        };
      },
      import: async (workflowDefinitionId, file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await httpClient.post(`v1/workflow-definitions/${workflowDefinitionId}/import`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
    },
    workflowTestApi: {
      execute: async (request) => {
        const response = await httpClient.post(`v1/workflow-test/execute`, request);
        return response.data;
      },
      restartFromActivity: async (request) => {
        await httpClient.post(`v1/workflow-test/restartFromActivity`, request);
      },
      stop: async (request) => {
        await httpClient.post(`v1/workflow-test/stop`, request);
      }
    },
    workflowRegistryApi: {
      list: async (providerName, page, pageSize, versionOptions) => {
        const queryString = {
          version: getVersionOptionsString(versionOptions)
        };
        if (!!page || page === 0)
          queryString['page'] = page;
        if (!!pageSize)
          queryString['pageSize'] = pageSize;
        const queryStringItems = collection.map(queryString, (v, k) => `${k}=${v}`);
        const queryStringText = queryStringItems.length > 0 ? `?${queryStringItems.join('&')}` : '';
        const response = await httpClient.get(`v1/workflow-registry/by-provider/${providerName}${queryStringText}`);
        return response.data;
      },
      listAll: async (versionOptions) => {
        const queryString = {
          version: getVersionOptionsString(versionOptions)
        };
        const queryStringItems = collection.map(queryString, (v, k) => `${k}=${v}`);
        const queryStringText = queryStringItems.length > 0 ? `?${queryStringItems.join('&')}` : '';
        const response = await httpClient.get(`v1/workflow-registry${queryStringText}`);
        return response.data;
      },
      findManyByDefinitionVersionIds: async (definitionVersionIds) => {
        if (definitionVersionIds.length == 0)
          return [];
        const idsQuery = definitionVersionIds.join(",");
        const response = await httpClient.get(`v1/workflow-registry/by-definition-version-ids?ids=${idsQuery}`);
        return response.data;
      },
      get: async (id, versionOptions) => {
        const versionOptionsString = getVersionOptionsString(versionOptions);
        const response = await httpClient.get(`v1/workflow-registry/${id}/${versionOptionsString}`);
        return response.data;
      }
    },
    workflowInstancesApi: {
      list: async (page, pageSize, workflowDefinitionId, workflowStatus, orderBy, searchTerm, correlationId) => {
        const queryString = {};
        if (!!workflowDefinitionId)
          queryString['workflow'] = workflowDefinitionId;
        if (!!correlationId)
          queryString['correlationId'] = correlationId;
        if (workflowStatus != null)
          queryString['status'] = workflowStatus;
        if (!!orderBy)
          queryString['orderBy'] = orderBy;
        if (!!searchTerm)
          queryString['searchTerm'] = searchTerm;
        if (!!page)
          queryString['page'] = page;
        if (!!pageSize)
          queryString['pageSize'] = pageSize;
        const queryStringItems = collection.map(queryString, (v, k) => `${k}=${v}`);
        const queryStringText = queryStringItems.length > 0 ? `?${queryStringItems.join('&')}` : '';
        const response = await httpClient.get(`v1/workflow-instances${queryStringText}`);
        return response.data;
      },
      get: async (id) => {
        const response = await httpClient.get(`v1/workflow-instances/${id}`);
        return response.data;
      },
      cancel: async (id) => {
        await httpClient.post(`v1/workflow-instances/${id}/cancel`);
      },
      delete: async (id) => {
        await httpClient.delete(`v1/workflow-instances/${id}`);
      },
      retry: async (id) => {
        await httpClient.post(`v1/workflow-instances/${id}/retry`, { runImmediately: false });
      },
      bulkCancel: async (request) => {
        const response = await httpClient.post(`v1/workflow-instances/bulk/cancel`, request);
        return response.data;
      },
      bulkDelete: async (request) => {
        const response = await httpClient.delete(`v1/workflow-instances/bulk`, {
          data: request
        });
        return response.data;
      },
      bulkRetry: async (request) => {
        const response = await httpClient.post(`v1/workflow-instances/bulk/retry`, request);
        return response.data;
      }
    },
    workflowExecutionLogApi: {
      get: async (workflowInstanceId, page, pageSize) => {
        const queryString = {};
        if (!!page)
          queryString['page'] = page;
        if (!!pageSize)
          queryString['pageSize'] = pageSize;
        const queryStringItems = collection.map(queryString, (v, k) => `${k}=${v}`);
        const queryStringText = queryStringItems.length > 0 ? `?${queryStringItems.join('&')}` : '';
        const response = await httpClient.get(`v1/workflow-instances/${workflowInstanceId}/execution-log${queryStringText}`);
        return response.data;
      }
    },
    scriptingApi: {
      getJavaScriptTypeDefinitions: async (workflowDefinitionId, context) => {
        const response = await httpClient.post(`v1/scripting/javascript/type-definitions/${workflowDefinitionId}?t=${new Date().getTime()}`, context);
        return response.data;
      }
    },
    designerApi: {
      runtimeSelectItemsApi: {
        get: async (providerTypeName, context) => {
          const response = await httpClient.post('v1/designer/runtime-select-list', {
            providerTypeName: providerTypeName,
            context: context
          });
          return response.data;
        }
      }
    },
    activityStatsApi: {
      get: async (workflowInstanceId, activityId) => {
        const response = await httpClient.get(`v1/workflow-instances/${workflowInstanceId}/activity-stats/${activityId}`);
        return response.data;
      }
    },
    workflowStorageProvidersApi: {
      list: async () => {
        const response = await httpClient.get('v1/workflow-storage-providers');
        return response.data;
      }
    },
    workflowProvidersApi: {
      list: async () => {
        const response = await httpClient.get('v1/workflow-providers');
        return response.data;
      }
    },
    workflowChannelsApi: {
      list: async () => {
        const response = await httpClient.get('v1/workflow-channels');
        return response.data;
      }
    },
    featuresApi: {
      list: async () => {
        const response = await httpClient.get('v1/features');
        return response.data.features;
      }
    },
  };
  return _elsaClient;
};

export { createElsaClient as a, createHttpClient as c };
