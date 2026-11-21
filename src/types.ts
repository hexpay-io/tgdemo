/**
 * Product types and payment models
 */

import { components } from "./generated/schema";

// Re-export commonly used HexPay types for convenience
export type PaymentResponse = components["schemas"]["PaymentResponse"];
export type PaymentStatus = components["schemas"]["PaymentStatus"];
export type CreatePaymentRequest =
  components["schemas"]["CreatePaymentRequest"];
export type PaymentDetails = components["schemas"]["PaymentDetails"];
export type MethodRestriction = components["schemas"]["MethodRestriction"];
export type ErrorResponse = components["schemas"]["ErrorResponse"];

/**
 * Product definition for the air store
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  emoji: string;
}

/**
 * Internal payment record stored in the bot's database
 */
export interface PaymentRecord {
  paymentID: string;
  userId: number;
  productId: string;
  productName: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  paymentLink?: string;
  metadata?: {
    telegram_user_id: string;
    store_name: string;
  };
}
