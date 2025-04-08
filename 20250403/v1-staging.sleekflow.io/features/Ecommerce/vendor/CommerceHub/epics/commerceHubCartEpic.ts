import { Action, LoginType } from "types/LoginType";
import { combineEpics } from "redux-observable";
import { addToCartEpic } from "features/Ecommerce/vendor/CommerceHub/epics/addToCartEpic";
import { openCartEpic } from "features/Ecommerce/vendor/CommerceHub/epics/openCartEpic";
import { updateCartItemEpic } from "features/Ecommerce/vendor/CommerceHub/epics/updateCartItemEpic";
import { deleteFromCartEpic } from "features/Ecommerce/vendor/CommerceHub/epics/deleteFromCartEpic";
import { recalculateCartEpic } from "features/Ecommerce/vendor/CommerceHub/epics/recalculateCartEpic";
import { clearCartEpic } from "features/Ecommerce/vendor/CommerceHub/epics/clearCartEpic";
import { changeCartDiscountEpic } from "features/Ecommerce/vendor/CommerceHub/epics/changeCartDiscountEpic";
import { updateItemDiscountEpic } from "features/Ecommerce/vendor/CommerceHub/epics/updateItemDiscountEpic";

export const commerceHubCartEpic = combineEpics<Action, Action, LoginType, any>(
  // @ts-ignore
  openCartEpic,
  addToCartEpic,
  updateCartItemEpic,
  deleteFromCartEpic,
  recalculateCartEpic,
  changeCartDiscountEpic,
  updateItemDiscountEpic,
  clearCartEpic
);
