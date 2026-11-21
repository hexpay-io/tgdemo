import { PaymentRecord } from "./types";
import { logger } from "./logger";

const payments = new Map<string, PaymentRecord>();

export function savePayment(payment: PaymentRecord): void {
  payments.set(payment.paymentID, payment);
  logger.payment("Payment saved to memory", payment.paymentID, payment.userId, {
    productName: payment.productName,
    amount: payment.amount,
  });
}

export function getPaymentById(paymentID: string): PaymentRecord | null {
  return payments.get(paymentID) || null;
}

export function updatePayment(payment: PaymentRecord): void {
  payments.set(payment.paymentID, {
    ...payments.get(payment.paymentID),
    ...payment,
    updatedAt: new Date().toISOString(),
  } as PaymentRecord);
  logger.payment(
    "Payment updated in memory",
    payment.paymentID,
    payment.userId,
    {
      status: payment.status,
    },
  );
}

export function getUserPayments(userId: number): PaymentRecord[] {
  return Array.from(payments.values()).filter((p) => p.userId === userId);
}

export function getPaymentStats(): {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  totalVolume: number;
} {
  const paymentArray = Array.from(payments.values());

  return {
    total: paymentArray.length,
    completed: paymentArray.filter((p) => p.status === "completed").length,
    pending: paymentArray.filter((p) => p.status === "pending").length,
    failed: paymentArray.filter(
      (p) => p.status === "expired" || p.status === "cancelled",
    ).length,
    totalVolume: paymentArray.reduce((sum, p) => sum + p.amount, 0),
  };
}
