import { WhatsappCloudAPIOrderItemType } from "core/models/Message/WhatsappCloudAPIMessageType";

export function getCartCurrencies(items: WhatsappCloudAPIOrderItemType[]) {
  return items.reduce<string[]>((acc, next) => {
    if (!acc.includes(next.currency)) {
      return [...acc, next.currency];
    }
    return acc;
  }, []);
}
