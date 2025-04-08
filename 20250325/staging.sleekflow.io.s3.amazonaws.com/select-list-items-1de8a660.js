'use strict';

require('./domain-b01b4a53.js');
const elsaClient = require('./elsa-client-e99f1b35.js');
require('./utils-5d19a660.js');
require('./index-1eae61b2.js');
require('./cronstrue-62722667.js');

async function fetchRuntimeItems(serverUrl, options) {
  const elsaClient$1 = await elsaClient.createElsaClient(serverUrl);
  return await elsaClient$1.designerApi.runtimeSelectItemsApi.get(options.runtimeSelectListProviderType, options.context || {});
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

exports.getSelectListItems = getSelectListItems;
