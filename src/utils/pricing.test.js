/**
 * Pricing Utility Tests
 *
 * Run this file to test pricing calculations
 * Usage: node src/utils/pricing.test.js
 */

const pricing = require("./pricing");

console.log("🧪 Testing Pricing Utilities\n");

// Test 1: Experience with valid prices
console.log("Test 1: Experience with valid prices");
const exp1 = {
  options: [
    {
      paxRates: [
        { rates: { USD: 100, LKR: 30000 } },
        { rates: { USD: 150, LKR: 45000 } },
      ],
    },
  ],
  offer: 0,
};
const result1 = pricing.calculateMinPrices_Experience(exp1);
console.log("Input:", JSON.stringify(exp1, null, 2));
console.log("Output:", result1);
console.log("Expected: { minPriceUSD: 100, minPriceLKR: 30000 }");
console.log(
  "✅ Pass:",
  result1.minPriceUSD === 100 && result1.minPriceLKR === 30000,
);
console.log("\n---\n");

// Test 2: Experience with 10% discount
console.log("Test 2: Experience with 10% discount");
const exp2 = {
  options: [
    {
      paxRates: [{ rates: { USD: 100, LKR: 30000 } }],
    },
  ],
  offer: 10,
};
const result2 = pricing.calculateMinPrices_Experience(exp2);
console.log("Input:", JSON.stringify(exp2, null, 2));
console.log("Output:", result2);
console.log("Expected: { minPriceUSD: 90, minPriceLKR: 27000 }");
console.log(
  "✅ Pass:",
  result2.minPriceUSD === 90 && result2.minPriceLKR === 27000,
);
console.log("\n---\n");

// Test 3: Tour with multiple pax rates
console.log("Test 3: Tour with multiple pax rates");
const tour1 = {
  paxRates: [
    { rates: { USD: 500, LKR: 150000 } },
    { rates: { USD: 600, LKR: 180000 } },
    { rates: { USD: 450, LKR: 135000 } },
  ],
  offer: 0,
};
const result3 = pricing.calculateMinPrices_Tour(tour1);
console.log("Input:", JSON.stringify(tour1, null, 2));
console.log("Output:", result3);
console.log("Expected: { minPriceUSD: 450, minPriceLKR: 135000 }");
console.log(
  "✅ Pass:",
  result3.minPriceUSD === 450 && result3.minPriceLKR === 135000,
);
console.log("\n---\n");

// Test 4: Tour with 15% discount
console.log("Test 4: Tour with 15% discount");
const tour2 = {
  paxRates: [{ rates: { USD: 500, LKR: 150000 } }],
  offer: 15,
};
const result4 = pricing.calculateMinPrices_Tour(tour2);
console.log("Input:", JSON.stringify(tour2, null, 2));
console.log("Output:", result4);
console.log("Expected: { minPriceUSD: 425, minPriceLKR: 127500 }");
console.log(
  "✅ Pass:",
  result4.minPriceUSD === 425 && result4.minPriceLKR === 127500,
);
console.log("\n---\n");

// Test 5: Merchandise with options
console.log("Test 5: Merchandise with options");
const merch1 = {
  options: {
    option: [
      { cost: { USD: 25, LKR: 7500 } },
      { cost: { USD: 35, LKR: 10500 } },
      { cost: { USD: 30, LKR: 9000 } },
    ],
  },
  offer: 0,
};
const result5 = pricing.calculateMinPrices_Merchandise(merch1);
console.log("Input:", JSON.stringify(merch1, null, 2));
console.log("Output:", result5);
console.log("Expected: { minPriceUSD: 25, minPriceLKR: 7500 }");
console.log(
  "✅ Pass:",
  result5.minPriceUSD === 25 && result5.minPriceLKR === 7500,
);
console.log("\n---\n");

// Test 6: Merchandise with 20% discount
console.log("Test 6: Merchandise with 20% discount");
const merch2 = {
  options: {
    option: [{ cost: { USD: 25, LKR: 7500 } }],
  },
  offer: 20,
};
const result6 = pricing.calculateMinPrices_Merchandise(merch2);
console.log("Input:", JSON.stringify(merch2, null, 2));
console.log("Output:", result6);
console.log("Expected: { minPriceUSD: 20, minPriceLKR: 6000 }");
console.log(
  "✅ Pass:",
  result6.minPriceUSD === 20 && result6.minPriceLKR === 6000,
);
console.log("\n---\n");

// Test 7: Mixed valid/invalid prices
console.log("Test 7: Mixed valid/invalid prices");
const exp3 = {
  options: [
    {
      paxRates: [
        { rates: { USD: 0, LKR: 0 } }, // Invalid
        { rates: { USD: null, LKR: 5000 } }, // Partial
        { rates: { USD: 30, LKR: 9000 } }, // Valid
      ],
    },
  ],
  offer: 0,
};
const result7 = pricing.calculateMinPrices_Experience(exp3);
console.log("Input:", JSON.stringify(exp3, null, 2));
console.log("Output:", result7);
console.log("Expected: { minPriceUSD: 30, minPriceLKR: 5000 }");
console.log(
  "✅ Pass:",
  result7.minPriceUSD === 30 && result7.minPriceLKR === 5000,
);
console.log("\n---\n");

// Test 8: No valid prices
console.log("Test 8: No valid prices");
const exp4 = {
  options: [],
  offer: 0,
};
const result8 = pricing.calculateMinPrices_Experience(exp4);
console.log("Input:", JSON.stringify(exp4, null, 2));
console.log("Output:", result8);
console.log("Expected: { minPriceUSD: null, minPriceLKR: null }");
console.log(
  "✅ Pass:",
  result8.minPriceUSD === null && result8.minPriceLKR === null,
);
console.log("\n---\n");

// Test 9: Decimal discount (33.33%)
console.log("Test 9: Decimal discount (33.33%)");
const tour3 = {
  paxRates: [{ rates: { USD: 300, LKR: 90000 } }],
  offer: 33.33,
};
const result9 = pricing.calculateMinPrices_Tour(tour3);
console.log("Input:", JSON.stringify(tour3, null, 2));
console.log("Output:", result9);
console.log(
  "Expected: { minPriceUSD: 200.01, minPriceLKR: 60002.70 } (rounded)",
);
console.log(
  "✅ Pass:",
  result9.minPriceUSD === 200.01 && result9.minPriceLKR === 60002.7,
);
console.log("\n---\n");

// Test 10: Apply discount helper
console.log("Test 10: Apply discount helper");
const price = 100;
const offer = 15;
const discounted = pricing.applyDiscount(price, offer);
console.log(`Input: price=${price}, offer=${offer}%`);
console.log("Output:", discounted);
console.log("Expected: 85");
console.log("✅ Pass:", discounted === 85);
console.log("\n---\n");

// Test 11: Tour — paxRates present but rates sub-component missing (ID-only, publish flow)
console.log("Test 11: Tour — paxRates ID-only (no nested rates, simulates publish flow)");
const tour4 = {
  // Simulates data.paxRates when Strapi sends only component IDs without
  // re-inlining the nested rates sub-component (common in publish operations).
  paxRates: [
    { id: 1, minPax: 1, maxPax: 4 },
    { id: 2, minPax: 5, maxPax: 8 },
  ],
  offer: 0,
};
const result11 = pricing.calculateMinPrices_Tour(tour4);
console.log("Input:", JSON.stringify(tour4, null, 2));
console.log("Output:", result11);
console.log("Expected: { minPriceUSD: null, minPriceLKR: null } (no rates data)");
console.log(
  "✅ Pass:",
  result11.minPriceUSD === null && result11.minPriceLKR === null,
);
console.log("\n---\n");

// Test 12: Tour — paxRates partially populated (some have rates, some are ID-only)
console.log("Test 12: Tour — paxRates partially populated (mixed)");
const tour5 = {
  paxRates: [
    { rates: { USD: 300, LKR: 90000 } },
    { rates: { USD: null, LKR: null } }, // invalid
    { rates: { USD: 250, LKR: 75000 } },
  ],
  offer: 0,
};
const result12 = pricing.calculateMinPrices_Tour(tour5);
console.log("Input:", JSON.stringify(tour5, null, 2));
console.log("Output:", result12);
console.log("Expected: { minPriceUSD: 250, minPriceLKR: 75000 }");
console.log(
  "✅ Pass:",
  result12.minPriceUSD === 250 && result12.minPriceLKR === 75000,
);
console.log("\n---\n");

// Test 13: Tour — empty paxRates array
console.log("Test 13: Tour — empty paxRates array");
const tour6 = { paxRates: [], offer: 0 };
const result13 = pricing.calculateMinPrices_Tour(tour6);
console.log("Input:", JSON.stringify(tour6, null, 2));
console.log("Output:", result13);
console.log("Expected: { minPriceUSD: null, minPriceLKR: null }");
console.log(
  "✅ Pass:",
  result13.minPriceUSD === null && result13.minPriceLKR === null,
);
console.log("\n---\n");

// Test 14: Tour — null paxRates
console.log("Test 14: Tour — null paxRates");
const tour7 = { paxRates: null, offer: 0 };
const result14 = pricing.calculateMinPrices_Tour(tour7);
console.log("Input:", JSON.stringify(tour7, null, 2));
console.log("Output:", result14);
console.log("Expected: { minPriceUSD: null, minPriceLKR: null }");
console.log(
  "✅ Pass:",
  result14.minPriceUSD === null && result14.minPriceLKR === null,
);
console.log("\n---\n");

console.log("🎉 All tests completed!");
console.log("\nTo run in Strapi context:");
console.log("1. SSH/connect to Strapi server");
console.log("2. cd /path/to/strapi");
console.log("3. node src/utils/pricing.test.js");
