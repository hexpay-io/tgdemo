import axios, { AxiosInstance, AxiosError } from "axios";
import { components, operations } from "./generated/schema";
import { logger } from "./logger";

// Type aliases for convenience
type CreatePaymentRequest = components["schemas"]["CreatePaymentRequest"];
type PaymentResponse = components["schemas"]["PaymentResponse"];
type PaymentStatus = components["schemas"]["PaymentStatus"];
type PaymentStatusResponse = components["schemas"]["PaymentStatusResponse"];
type ErrorResponse = components["schemas"]["ErrorResponse"];

export class HexPayClient {
  private client: AxiosInstance;

  constructor(apiUrl: string, apiToken?: string) {
    this.client = axios.create({
      baseURL: apiUrl,
      headers: {
        "Content-Type": "application/json",
        ...(apiToken && { Authorization: `Bearer ${apiToken}` }),
      },
      timeout: 10000,
    });
  }

  /**
   * Create a new payment
   * @param request Payment creation request
   * @returns Created payment details
   */
  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.client.post<PaymentResponse>(
        "/v1/payments",
        request,
      );

      logger.info("Payment created", {
        paymentId: response.data.id,
        amount: response.data.amount,
        currency: response.data.currency,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      this.handleError("Failed to create payment", error);
      throw error;
    }
  }

  /**
   * Get payment details by ID
   * @param paymentID Payment identifier (UUID)
   * @returns Full payment details
   */
  async getPaymentDetails(paymentID: string): Promise<PaymentResponse> {
    try {
      const response = await this.client.get<PaymentResponse>(
        `/v1/payments/${paymentID}`,
      );
      return response.data;
    } catch (error) {
      this.handleError("Failed to get payment details", error, { paymentID });
      throw error;
    }
  }

  /**
   * Get payment status only (lightweight endpoint)
   * @param paymentID Payment identifier (UUID)
   * @returns Payment status
   */
  async getPaymentStatus(paymentID: string): Promise<PaymentStatus> {
    try {
      const response = await this.client.get<PaymentStatusResponse>(
        `/v1/payments/${paymentID}/status`,
      );
      return response.data.status;
    } catch (error) {
      this.handleError("Failed to get payment status", error, { paymentID });
      throw error;
    }
  }

  /**
   * Cancel a payment
   * @param paymentID Payment identifier (UUID)
   * @returns Updated payment status
   */
  async cancelPayment(paymentID: string): Promise<PaymentStatus> {
    try {
      const response = await this.client.post<PaymentStatusResponse>(
        `/v1/payments/${paymentID}/cancel`,
      );

      logger.info("Payment cancelled", {
        paymentId: paymentID,
        status: response.data.status,
      });

      return response.data.status;
    } catch (error) {
      this.handleError("Failed to cancel payment", error, { paymentID });
      throw error;
    }
  }

  /**
   * Helper method to create a simple fiat payment
   * @param amount Amount in fiat currency
   * @param currency Currency code (e.g., "USD")
   * @param metadata Optional metadata
   * @returns Created payment
   */
  async createSimplePayment(
    amount: number,
    currency: string,
    metadata?: Record<string, string>,
  ): Promise<{ paymentID: string; paymentLink: string }> {
    const request: CreatePaymentRequest = {
      amount: amount.toFixed(2),
      currency,
      metadata,
    };

    const payment = await this.createPayment(request);

    return {
      paymentID: payment.id,
      paymentLink: payment.checkoutUrl,
    };
  }

  /**
   * Helper method to create a payment with preselected method
   * @param amount Amount in fiat or crypto
   * @param currency Currency code
   * @param coin Coin symbol (e.g., "USDT")
   * @param chain Chain symbol (e.g., "TON")
   * @param metadata Optional metadata
   * @returns Created payment with payment details
   */
  async createPreselectedPayment(
    amount: number,
    currency: string,
    coin: components["schemas"]["MethodRestriction"]["coin"],
    chain: components["schemas"]["MethodRestriction"]["chain"],
    metadata?: Record<string, string>,
  ): Promise<PaymentResponse> {
    const request: CreatePaymentRequest = {
      amount: amount.toFixed(2),
      currency,
      paymentOptions: {
        methods: [{ coin, chain }],
      },
      metadata,
    };

    return await this.createPayment(request);
  }

  /**
   * Error handler with structured logging
   */
  private handleError(
    message: string,
    error: unknown,
    context?: Record<string, any>,
  ): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorData = axiosError.response?.data?.error;

      logger.error(message, {
        ...context,
        status: axiosError.response?.status,
        errorType: errorData?.type,
        errorCode: errorData?.code,
        errorMessage: errorData?.message,
        errorParam: errorData?.param,
      });
    } else {
      logger.error(message, {
        ...context,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
