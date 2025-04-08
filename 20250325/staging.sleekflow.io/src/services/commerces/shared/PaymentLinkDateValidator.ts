import dayjs, { Dayjs } from 'dayjs';

interface PaymentDateStrategy {
  getMinMaxPaymentDate(): [minimum: Dayjs, maximum: Dayjs];
  validate(expirationDate: Dayjs): boolean;
  isSupportPaymentExpiration(): boolean;
}

export type PaymentVendorParam = 'stripe' | null;

class StripeStrategy implements PaymentDateStrategy {
  getMinMaxPaymentDate(): [Dayjs, Dayjs] {
    const now = dayjs();
    return [
      now.startOf('minute').add(31, 'minutes'),
      now.add(1, 'day').startOf('minute'),
    ];
  }

  validate(expirationDate: Dayjs): boolean {
    const [min, max] = this.getMinMaxPaymentDate();
    return expirationDate.isBetween(min, max, null, '[]');
  }

  isSupportPaymentExpiration() {
    return true;
  }
}

class PaymentsNonexpiringStrategy implements PaymentDateStrategy {
  getMinMaxPaymentDate(): [Dayjs, Dayjs] {
    throw 'Unable to calculate when payments are disabled';
  }

  validate(): boolean {
    return true;
  }
  isSupportPaymentExpiration() {
    return false;
  }
}

export class PaymentLinkDateValidator {
  private strategy: PaymentDateStrategy;

  constructor(paymentVendor: PaymentVendorParam) {
    switch (paymentVendor) {
      case 'stripe':
        this.strategy = new StripeStrategy();
        break;
      default:
        this.strategy = new PaymentsNonexpiringStrategy();
    }
  }

  getMinMaxPaymentDate(): [min: Dayjs, max: Dayjs] {
    return this.strategy.getMinMaxPaymentDate();
  }

  validate(expirationDate: string | Dayjs): boolean {
    const dateObj =
      typeof expirationDate === 'string'
        ? dayjs(expirationDate)
        : expirationDate;

    if (!dateObj.isValid()) return false;

    return this.strategy.validate(dateObj);
  }

  isSupportPaymentExpiration(): boolean {
    return this.strategy.isSupportPaymentExpiration();
  }
}
