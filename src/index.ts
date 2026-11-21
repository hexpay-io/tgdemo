/**
 * AirBottle Shop - Telegram Bot for HexPay
 *
 * A humorous MVP that sells bottled air using cryptocurrency payments
 * to showcase how simple HexPay integration is.
 *
 * Built entirely with AI assistance to prove that complex payment
 * integration can be implemented in minutes!
 */

import * as dotenv from "dotenv";
import { AirBottleBot } from "./bot";
import { logger } from "./logger";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const required = ["TG_BOT_TOKEN"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error("Missing required environment variables", {
      missing,
    });
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  try {
    // Validate environment
    validateEnvironment();

    const botToken = process.env.TG_BOT_TOKEN;
    const hexpayUrl =
      process.env.HEXPAY_API_URL || "https://api.demo.hexpay.io";
    const storeName = process.env.STORE_NAME || "AirBottle Shop";

    if (!botToken) {
      logger.error("TG_BOT_TOKEN is not set");
      process.exit(1);
    }

    logger.info("Bot starting", {
      storeName,
      hexpayUrl,
    });

    const bot = new AirBottleBot(botToken, hexpayUrl, storeName);

    bot.start();

    logger.info("Bot initialized successfully");

    process.on("SIGINT", () => {
      logger.info("Shutting down gracefully");
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start bot", {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

main();
