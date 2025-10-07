/**
 * Contract Configuration Utility
 *
 * Provides contract-specific parameters like lot size, multiplier, etc.
 * This allows the application to handle different contracts dynamically.
 */

// Default contract specifications
// These are fallbacks in case ContractSpecification.json is not available
const DEFAULT_CONTRACT_SPECS = {
  // Bitcoin
  BTCUSD: { lotSize: 0.001, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },
  BTC_USD: {
    lotSize: 0.001,
    multiplier: 1,
    takerFee: 0.0005,
    makerFee: 0.0002,
  },

  // Ethereum
  ETHUSD: { lotSize: 0.01, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },
  ETH_USD: { lotSize: 0.01, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },

  // BNB
  BNBUSD: { lotSize: 0.1, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },
  BNB_USD: { lotSize: 0.1, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },

  // Dogecoin
  DOGEUSD: { lotSize: 100, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },
  DOGE_USD: { lotSize: 100, multiplier: 1, takerFee: 0.0005, makerFee: 0.0002 },
};

/**
 * Extract the base symbol from a contract name
 * Examples:
 *   "BTCUSD" -> "BTC"
 *   "ETH-PERP" -> "ETH"
 *   "BTC_USD" -> "BTC"
 *   "Mark Price: BTC-USD" -> "BTC"
 */
function extractBaseSymbol(contractName) {
  if (!contractName) return null;

  // Remove common suffixes and prefixes
  const cleaned = contractName
    .toUpperCase()
    .replace(/MARK PRICE:?\s*/gi, "")
    .replace(/-PERP$/i, "")
    .replace(/USD$/i, "")
    .replace(/_USD$/i, "")
    .replace(/-USD$/i, "")
    .trim();

  // Extract the base symbol (first part before any delimiter)
  const match = cleaned.match(/^([A-Z]+)/);
  return match ? match[1] : null;
}

/**
 * Get contract specification for a given contract symbol
 *
 * @param {string} contractSymbol - The contract symbol (e.g., "BTCUSD", "ETH-PERP")
 * @returns {object} Contract specification with lotSize, multiplier, etc.
 */
export function getContractSpec(contractSymbol) {
  if (!contractSymbol) {
    console.warn("getContractSpec: No contract symbol provided");
    return DEFAULT_CONTRACT_SPECS.BTCUSD; // Default to BTC
  }

  // Normalize the symbol
  const normalized = contractSymbol.toUpperCase().replace(/[-_]/g, "");

  // Try direct match first
  if (DEFAULT_CONTRACT_SPECS[normalized]) {
    return DEFAULT_CONTRACT_SPECS[normalized];
  }

  // Try with underscore
  const withUnderscore = contractSymbol.toUpperCase().replace(/-/g, "_");
  if (DEFAULT_CONTRACT_SPECS[withUnderscore]) {
    return DEFAULT_CONTRACT_SPECS[withUnderscore];
  }

  // Try to match by base symbol
  const baseSymbol = extractBaseSymbol(contractSymbol);
  if (baseSymbol) {
    const baseMatch = Object.keys(DEFAULT_CONTRACT_SPECS).find((key) =>
      key.startsWith(baseSymbol)
    );
    if (baseMatch) {
      return DEFAULT_CONTRACT_SPECS[baseMatch];
    }
  }

  // Default fallback
  console.warn(
    `getContractSpec: Unknown contract "${contractSymbol}", using BTC defaults`
  );
  return DEFAULT_CONTRACT_SPECS.BTCUSD;
}

/**
 * Detect all unique contracts from fills data
 *
 * @param {Array} fills - Array of fill objects
 * @returns {Array} Array of unique contract symbols
 */
export function detectContracts(fills) {
  if (!Array.isArray(fills)) return [];

  const contracts = new Set();
  fills.forEach((f) => {
    const symbol = f.Contract || f.Symbol || f.contract || f.contractName;
    if (symbol) contracts.add(symbol);
  });

  return Array.from(contracts);
}

/**
 * Get lot size for a specific contract
 *
 * @param {string} contractSymbol - The contract symbol
 * @returns {number} Lot size for the contract
 */
export function getLotSize(contractSymbol) {
  const spec = getContractSpec(contractSymbol);
  return spec.lotSize;
}

/**
 * Get multiplier for a specific contract
 *
 * @param {string} contractSymbol - The contract symbol
 * @returns {number} Multiplier for the contract
 */
export function getMultiplier(contractSymbol) {
  const spec = getContractSpec(contractSymbol);
  return spec.multiplier;
}

/**
 * Validate contract specification
 *
 * @param {object} spec - Contract specification object
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidContractSpec(spec) {
  return (
    spec &&
    typeof spec.lotSize === "number" &&
    spec.lotSize > 0 &&
    typeof spec.multiplier === "number" &&
    spec.multiplier > 0
  );
}

/**
 * Get all supported contracts
 *
 * @returns {Array} Array of supported contract symbols
 */
export function getSupportedContracts() {
  return Object.keys(DEFAULT_CONTRACT_SPECS);
}

export default {
  getContractSpec,
  detectContracts,
  getLotSize,
  getMultiplier,
  isValidContractSpec,
  getSupportedContracts,
};
