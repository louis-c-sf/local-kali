'use strict';

require('./i18n-loader-00eaf44a.js');
require('./index-635081da.js');
const index = require('./index-915b0bc2.js');

function GetIntlMessage(i18next) {
  return (props) => (index.h("intl-message", Object.assign({}, Object.assign({ i18next }, props))));
}

exports.GetIntlMessage = GetIntlMessage;
