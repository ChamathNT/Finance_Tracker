const axios = require("axios");

const BASE_URL = "https://open.er-api.com/v6/latest/";

/**
 * Convert currency from one type to another.
 */
const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const response = await axios.get(`${BASE_URL}${fromCurrency}`);
    
    if (response.data.result !== "success") {
      throw new Error("Failed to fetch exchange rates");
    }

    const rate = response.data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
    }

    return (amount * rate).toFixed(2);
  } catch (error) {
    console.error("Currency conversion error:", error.message);
    return amount; // Return original amount if conversion fails
  }
};

module.exports = { convertCurrency };
