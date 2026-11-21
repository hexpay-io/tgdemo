/**
 * Bot Messages
 * Centralized message templates for consistent responses
 */

export const MESSAGES = {
  // Welcome message
  START: `🎉 *Welcome to HexAir Shop!*

We sell the world's finest bottled air 💨

Use these commands:
  • /shop - Browse our premium air products

Why choose us? Our air is:
  ✨ 100% organic and naturally sourced
  🔒 Blockchain-verified freshness
  🚀 Delivered instantly via crypto payments

📚 *About HexPay Integration*

This bot demonstrates the simplicity and power of HexPay! 🚀

💡 *Built Entirely with AI:*
This Telegram bot was created in minutes using AI assistance to showcase how easy it is to integrate crypto payments.

📖 Source Code: https://github.com/hexpay-io/tgdemo

Let's get you some air! /shop`,

  // Error messages
  PRODUCT_NOT_FOUND:
    "Product not found. Please use /menu to see available products.",
  PAYMENT_ERROR:
    "Sorry, we could not process your payment. Please try again later.",
  PAYMENT_FAILED: "❌ Payment failed. Please try again.",

  // Status messages
  PROCESSING_PAYMENT: (productName: string) =>
    `Processing payment for ${productName}...`,

  PAYMENT_SUCCESS: (productName: string, paymentID: string) =>
    `✅ Payment successful!\n\nYour ${productName} has been delivered! 🎉\n\nPayment ID: ${paymentID}`,

  // Payment demo message
  DEMO_PAYMENT: (productName: string, priceUSD: number, paymentID: string) =>
    `🧪 DEMO PAYMENT\n\nProduct: ${productName}\nAmount: $${priceUSD.toFixed(2)}\nPayment ID: ${paymentID}\n\n⏱️ This is a demo payment.\n\nAfter you select a cryptocurrency on the payment page, the payment will automatically complete within 60 seconds.\n\nClick the button below to proceed:`,
};
