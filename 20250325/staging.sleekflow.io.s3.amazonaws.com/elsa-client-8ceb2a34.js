'use strict';

const index = require('./index-a2f6d9eb.js');
const axiosMiddleware_esm = require('./axios-middleware.esm-f337c7ad.js');
const eventBus = require('./event-bus-8066af27.js');
require('./domain-b01b4a53.js');

let _httpClient = null;
let _elsaWebhooksClient = null;
const createHttpClient = function (baseAddress) {
  if (!!_httpClient)
    return _httpClient;
  const config = {
    baseURL: baseAddress
  };
  eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.HttpClientConfigCreated, this, { config });
  const httpClient = index.axios.create(config);
  const service = new axiosMiddleware_esm.HttpMiddlewareService(httpClient);
  eventBus.eventBus.emit(axiosMiddleware_esm.EventTypes.HttpClientCreated, this, { service, httpClient });
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

exports.createElsaWebhooksClient = createElsaWebhooksClient;
