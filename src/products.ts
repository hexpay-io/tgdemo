/**
 * Product Catalog
 * All bottled air products with witty descriptions
 */

import { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "premium_mountain",
    name: "Premium Mountain Air",
    description: "🏔️ Fresh alpine breeze captured at 2,500m elevation",
    priceUSD: 4.99,
    emoji: "🏔️",
  },
  {
    id: "tropical_paradise",
    name: "Tropical Paradise Air",
    description: "🌴 Caribbean vibes with hints of coconut essence",
    priceUSD: 6.99,
    emoji: "🌴",
  },
  {
    id: "ocean_breeze",
    name: "Ocean Breeze Air",
    description: "🌊 Salty sea air with authentic seafoam notes",
    priceUSD: 3.99,
    emoji: "🌊",
  },
  {
    id: "forest_mist",
    name: "Forest Mist Air",
    description: "🌲 Crisp woodland air with pinecone aromatics",
    priceUSD: 5.49,
    emoji: "🌲",
  },
  {
    id: "exclusive_nft",
    name: "Exclusive NFT Air™",
    description:
      "💎 Limited edition, blockchain-verified, collectible bottled air",
    priceUSD: 9.99,
    emoji: "💎",
  },
];

/**
 * Get product by ID
 */
export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/**
 * Get all products
 */
export function getAllProducts(): Product[] {
  return PRODUCTS;
}

/**
 * Format product display for Telegram
 */
export function formatProductDisplay(product: Product): string {
  return `${product.emoji} *${product.name}*\n_${product.description}_\n💰 $${product.priceUSD.toFixed(2)} USD`;
}

/**
 * Get product menu text
 */
export function getProductMenuText(): string {
  let text = "🛍️ *Welcome to HexAir Shop!*\n\n";
  text += "Select a bottled air product:\n\n";

  PRODUCTS.forEach((product, index) => {
    text += `${formatProductDisplay(product)}\n`;
    if (index < PRODUCTS.length - 1) {
      text += "\n─────────────────\n\n";
    }
  });

  text +=
    '\n\n_Click the "Buy" button next to a product to proceed to checkout._';

  return text;
}
