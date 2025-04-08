import { a as axios } from './index-b5781c88.js';
import { E as EventTypes, H as HttpMiddlewareService } from './axios-middleware.esm-b5e3eb44.js';
import { e as eventBus } from './event-bus-be6948e5.js';
import './domain-a7b2c384.js';

let _httpClient = null;
let _elsaWebhooksClient = null;
const createHttpClient = function (baseAddress) {
  if (!!_httpClient)
    return _httpClient;
  const config = {
    baseURL: baseAddress
  };
  eventBus.emit(EventTypes.HttpClientConfigCreated, this, { config });
  const httpClient = axios.create(config);
  const service = new HttpMiddlewareService(httpClient);
  eventBus.emit(EventTypes.HttpClientCreated, this, { service, httpClient });
  return _httpClient = httpClient;
};
const createElsaWebhooksClient = function (serverUrl) {
  if (!!_elsaWebhooksClient)
    return _elsaWebhooksClient;
  const httpClient = createHttpClient(serverUrl);
  _elsaWebhooksClient = {
    webhookDefinitionsApi: {
      list: async (page, pageSize) => {
        const response = await httpClient.get(`v1/webhook-definitions`);
        return response.data;
      },
      getByWebhookId: async (webhookId) => {
        const response = await httpClient.get(`v1/webhook-definitions/${webhookId}`);
        return response.data;
      },
      save: async (request) => {
        const response = await httpClient.post('v1/webhook-definitions', request);
        return response.data;
      },
      update: async (request) => {
        const response = await httpClient.put('v1/webhook-definitions', request);
        return response.data;
      },
      delete: async (webhookId) => {
        await httpClient.delete(`v1/webhook-definitions/${webhookId}`);
      },
    }
  };
  return _elsaWebhooksClient;
};

export { createElsaWebhooksClient as c };
