const cron = require("node-cron");
const TransactionService = require("../services/transactionServices");

async function processRecurringTransactions() {
  console.log("⏳ Checking for recurring transactions...");

  try {
    await TransactionService.handleRecurringTransactions();
    console.log("✅ Recurring transactions processed.");
  } catch (error) {
    console.error("❌ Error processing recurring transactions:", error);
  }
}

// Run the job every 2 minutes
cron.schedule("*/2 * * * *", processRecurringTransactions);

console.log("🔄 Recurring transactions processor is running every 2 minutes...");

module.exports = { processRecurringTransactions };
