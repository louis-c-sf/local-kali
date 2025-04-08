import { PaymentLinkWriteType } from "api/StripePayment/submitCreatePaymentLinks";
import { PaymentLinkFormItemType } from "features/Ecommerce/Payment/usecases/Inbox/SendPayment/contracts/PaymentFormType";
import { money } from "utility/math/money";

export async function normalizePaymentLinkRequest(
  payment: PaymentLinkFormItemType,
  discountRate: number,
  imageUpdated?: File
): Promise<PaymentLinkWriteType> {
  const mainData: PaymentLinkWriteType = {
    amount: payment.amount,
    quantity: payment.quantity,
    name: payment.name,
    description: payment.description,
    currency: payment.currency.toLowerCase(),
    totalDiscount: money(payment.amount).div(100).mul(discountRate).toNumber(),
    metadata: payment.metadata,
  };

  if (payment.imageUrl) {
    mainData.imageUrls = [payment.imageUrl];
  } else if (imageUpdated) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          ...mainData,
          imageFiles: [
            {
              file: btoa(reader.result as string),
              filename: imageUpdated.name,
            },
          ],
        });
      };
      reader.onerror = () => {
        //todo interrupt upload?
        resolve(mainData);
      };
      reader.readAsBinaryString(imageUpdated);
    });
  }
  return mainData;
}
