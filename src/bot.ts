/**
 * Telegram Bot Implementation
 * Main bot logic and command handlers
 */

import TelegramBot, { InlineKeyboardMarkup } from "node-telegram-bot-api";
import { HexPayClient } from "./hexpayClient";
import { PRODUCTS, getProductById, getProductMenuText } from "./products";
import { MESSAGES } from "./messages";
import { savePayment, getPaymentById, updatePayment } from "./paymentDatabase";
import { PaymentRecord } from "./types";
import { logger } from "./logger";

export class AirBottleBot {
  private bot: TelegramBot;
  private hexpay: HexPayClient;
  private storeName: string;
  private processingPayments: Map<string, boolean>;

  constructor(
    botToken: string,
    hexpayUrl: string,
    storeName: string,
  ) {
    this.bot = new TelegramBot(botToken, { polling: true });
    this.hexpay = new HexPayClient(hexpayUrl);
    this.storeName = storeName;
    this.processingPayments = new Map();

    this.setupHandlers();
  }

  /**
   * Setup all command and callback handlers
   */
  private setupHandlers(): void {
    // Command handlers
    this.bot.onText(/^\/start$/, (msg) => this.handleStart(msg));
    this.bot.onText(/^\/shop$/, (msg) => this.handleMenu(msg));
    this.bot.onText(/^\/buy\s+(\w+)$/, (msg, match) =>
      this.handleBuy(msg, match![1]),
    );

    // Callback handlers for inline buttons
    this.bot.on("callback_query", (query) => this.handleCallbackQuery(query));

    // Error handler
    this.bot.on("error", (error) => {
      logger.error("Bot error", {
        error: error instanceof Error ? error.message : String(error),
      });
    });

    logger.info("Bot handlers initialized");
  }

  /**
   * Handle /start command
   */
  private async handleStart(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;

    try {
      await this.bot.sendMessage(chatId, MESSAGES.START, {
        parse_mode: "Markdown",
      });
      logger.info("User started bot", { userId: chatId });
    } catch (error) {
      logger.error("Error in handleStart", {
        userId: chatId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Handle /shop command
   */
  private async handleMenu(msg: TelegramBot.Message): Promise<void> {
    const chatId = msg.chat.id;

    try {
      const menuText = getProductMenuText();

      // Create inline keyboard with buy buttons
      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: PRODUCTS.map((product) => [
          {
            text: `🛒 Buy ${product.emoji} - $${product.priceUSD.toFixed(2)}`,
            callback_data: `buy:${product.id}`,
          },
        ]),
      };

      await this.bot.sendMessage(chatId, menuText, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });

      logger.info("User viewed menu", { userId: chatId });
    } catch (error) {
      logger.error("Error in handleMenu", {
        userId: chatId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Handle /buy command or buy button callback
   */
  private async handleBuy(
    msg: TelegramBot.Message,
    productId: string,
  ): Promise<void> {
    const chatId = msg.chat.id;
    const product = getProductById(productId);

    if (!product) {
      try {
        await this.bot.sendMessage(chatId, MESSAGES.PRODUCT_NOT_FOUND, {
          parse_mode: "Markdown",
        });
      } catch (error) {
        logger.error("Error sending product not found message", {
          userId: chatId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return;
    }

    try {
      // Inform user
      await this.bot.sendMessage(
        chatId,
        MESSAGES.PROCESSING_PAYMENT(product.name),
        { parse_mode: "Markdown" },
      );

      // Create payment with HexPay
      const paymentResult = await this.hexpay.createSimplePayment(
        product.priceUSD,
        "USD",
        {
          telegram_user_id: chatId.toString(),
          product_id: product.id,
          product_name: product.name,
          store_name: this.storeName,
        },
      );

      const paymentID = paymentResult.paymentID;
      const paymentLink = paymentResult.paymentLink;

      // Save payment record
      const payment: PaymentRecord = {
        paymentID,
        userId: chatId,
        productId: product.id,
        productName: product.name,
        amount: product.priceUSD,
        currency: "USD",
        status: "created",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        paymentLink,
        metadata: {
          telegram_user_id: chatId.toString(),
          store_name: this.storeName,
        },
      };

      savePayment(payment);

      // Send payment link with inline button
      const keyboard: InlineKeyboardMarkup = {
        inline_keyboard: [
          [
            {
              text: "💳 Complete Payment",
              url: paymentLink,
            },
          ],
        ],
      };

      const paymentMessage = MESSAGES.DEMO_PAYMENT(
        product.name,
        product.priceUSD,
        paymentID,
      );

      await this.bot.sendMessage(chatId, paymentMessage, {
        reply_markup: keyboard,
      });

      // Start monitoring payment status via API
      this.monitorPaymentStatus(chatId, paymentID, product.name);

      logger.payment("Payment created", paymentID, chatId, {
        productId: product.id,
        productName: product.name,
        amount: product.priceUSD,
      });
    } catch (error) {
      logger.error("Error creating payment", {
        userId: chatId,
        error: error instanceof Error ? error.message : String(error),
      });

      await this.bot.sendMessage(chatId, MESSAGES.PAYMENT_ERROR, {
        parse_mode: "Markdown",
      });
    }
  }

  /**
   * Handle callback queries from inline buttons
   */
  private async handleCallbackQuery(
    query: TelegramBot.CallbackQuery,
  ): Promise<void> {
    const chatId = query.from.id;
    const data = query.data || "";

    try {
      // Answer the callback query (remove loading state)
      await this.bot.answerCallbackQuery(query.id);

      if (data.startsWith("buy:")) {
        const productId = data.substring(4);
        // Create a fake message object for compatibility
        const fakeMsg: TelegramBot.Message = {
          message_id: 0,
          date: Math.floor(Date.now() / 1000),
          chat: {
            id: chatId,
            type: "private",
          },
        };
        await this.handleBuy(fakeMsg, productId);
      }
    } catch (error) {
      logger.error("Error in handleCallbackQuery", {
        userId: chatId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Monitor payment status and update user
   */
  private monitorPaymentStatus(
    chatId: number,
    paymentID: string,
    productName: string,
  ): void {
    // Prevent duplicate monitoring
    if (this.processingPayments.has(paymentID)) {
      return;
    }

    this.processingPayments.set(paymentID, true);

    // Check payment status every 10 seconds for up to 15 minutes
    let checks = 0;
    const maxChecks = 90; // 15 minutes / 10 seconds

    const checkInterval = setInterval(async () => {
      try {
        checks++;

        const payment = await this.hexpay.getPaymentDetails(paymentID);
        const status = payment.status;

        // Update local record
        const localPayment = getPaymentById(paymentID);
        if (localPayment) {
          updatePayment({
            ...localPayment,
            status: status,
          });
          logger.payment("Payment status updated", paymentID, chatId, {
            status: status,
          });
        }

        // Send status updates only on state changes
        if (status === "completed") {
          // Payment complete!
          try {
            await this.bot.sendMessage(
              chatId,
              MESSAGES.PAYMENT_SUCCESS(productName, paymentID),
            );
          } catch (error) {
            logger.error("Error sending completion message", {
              paymentId: paymentID,
              userId: chatId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
          clearInterval(checkInterval);
          this.processingPayments.delete(paymentID);
          return;
        } else if (status === "expired" || status === "cancelled") {
          // Payment failed or cancelled
          try {
            await this.bot.sendMessage(chatId, MESSAGES.PAYMENT_FAILED);
          } catch (error) {
            logger.error("Error sending failure message", {
              paymentId: paymentID,
              userId: chatId,
              error: error instanceof Error ? error.message : String(error),
            });
          }
          clearInterval(checkInterval);
          this.processingPayments.delete(paymentID);
          return;
        }

        // Stop checking after max attempts
        if (checks >= maxChecks) {
          clearInterval(checkInterval);
          this.processingPayments.delete(paymentID);
        }
      } catch (error) {
        logger.error("Error monitoring payment", {
          paymentId: paymentID,
          userId: chatId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }, 10000); // Check every 10 seconds

    // Stop checking after 15 minutes
    setTimeout(
      () => {
        clearInterval(checkInterval);
        this.processingPayments.delete(paymentID);
      },
      15 * 60 * 1000,
    );
  }

  /**
   * Start the bot
   */
  public start(): void {
    logger.info("AirBottle Bot is running and listening for messages");
  }
}
