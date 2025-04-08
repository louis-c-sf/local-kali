import './domain-a7b2c384.js';
import { a as createElsaClient } from './elsa-client-d55095c1.js';
import './utils-823f97c1.js';
import './index-f1836928.js';
import './cronstrue-69b0e3b3.js';

async function fetchRuntimeItems(serverUrl, options) {
  const elsaClient = await createElsaClient(serverUrl);
  return await elsaClient.designerApi.runtimeSelectItemsApi.get(options.runtimeSelectListProviderType, options.context || {});
}
async function getSelectListItems(serverUrl, propertyDescriptor) {
  const options = propertyDescriptor.options;
  let selectList;
  if (!!options && options.runtimeSelectListProviderType)
    selectList = await fetchRuntimeItems(serverUrl, options);
  else if (Array.isArray(options))
    selectList = {
      items: options,
      isFlagsEnum: false
    };
  else
    selectList = options;
  return selectList || { items: [], isFlagsEnum: false };
}

export { getSelectListItems as g };
