import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlert,
  generateMonthlyReports,
  processRecurringTransaction,
  triggerRecurringTransactions,
} from "@/lib/inngest/functions";
import { serve } from "inngest/next";

// create an api which serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports,
  ],
});
