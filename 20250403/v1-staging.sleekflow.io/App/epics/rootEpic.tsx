import { combineEpics } from "redux-observable";
import { summaryEpic } from "../../component/Chat/epics/summaryEpic";
import { Action, LoginType } from "../../types/LoginType";
import { searchMessagesEpic } from "../../component/Chat/epics/searchMessage/searchMessagesEpic";
import { foundMessageClickEpic } from "../../component/Chat/epics/searchMessage/foundMessageClickEpic";
import { loadSearchMessagesContextEpic } from "../../component/Chat/epics/searchMessage/loadSearchMessagesContextEpic";
import { scrollContextEpic } from "../../component/Chat/epics/searchMessage/scrollContextEpic";
import { loadCompanyEpic } from "./company/loadCompanyEpic";
import { loadAnalyticsEpic } from "./Chat/Analytics/loadAnalyticsEpic";
import { loadPreselectedMessagesContextEpic } from "component/Chat/epics/messagesContext/loadPreselectedMessagesContextEpic";
import { preselectedMessageScrollEpic } from "component/Chat/epics/messagesContext/preselectedMessageScrollEpic";
import { preselectMessageEpic } from "component/Chat/epics/messagesContext/preselectMessageEpic";
import { deleteMessageEpic } from "./Chat/deleteMessageEpic";
import { typeIndicatorEpic } from "component/Chat/epics/messagesContext/typeIndicatorEpic";
import { commerceHubCartEpic } from "features/Ecommerce/vendor/CommerceHub/epics/commerceHubCartEpic";
import { shopifyCartEpic } from "features/Ecommerce/vendor/Shopify/epics/shopifyCartEpic";
import { companyUsageEpic } from "../../component/Chat/epics/companyUsageEpic";
import { whatsappCloudApiCatalogsEpic } from "features/WhatsappCloudAPI/reducers/whatsappCloudApiCatalogsEpic";
import { conversationMessageEpic } from "component/Chat/epics/messagesContext/conversationMessageEpic";

export default combineEpics<Action, Action, LoginType, any>(
  // @ts-ignore
  conversationMessageEpic,
  summaryEpic,
  companyUsageEpic,
  searchMessagesEpic,
  foundMessageClickEpic,
  preselectMessageEpic,
  loadSearchMessagesContextEpic,
  loadPreselectedMessagesContextEpic,
  loadAnalyticsEpic,
  scrollContextEpic,
  typeIndicatorEpic,
  preselectedMessageScrollEpic,
  loadCompanyEpic,
  deleteMessageEpic,
  commerceHubCartEpic,
  shopifyCartEpic,
  whatsappCloudApiCatalogsEpic
);
