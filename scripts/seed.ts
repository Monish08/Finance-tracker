import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import {
  eachDayOfInterval,
  format,
  subDays,
} from "date-fns";

import {
  accounts,
  categories,
  transactions,
} from "@/db/schema";

config({ path: ".env.local" });

/* ----------------------------- DB SETUP ----------------------------- */

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

/* ----------------------------- CONSTANTS ----------------------------- */

const SEED_USER_ID = "user_39KIu84QlfH0Xm8xo6Bo5WbFjoY";

/* ----------------------------- CATEGORIES ----------------------------- */

const SEED_CATEGORIES = [
  { id: "category_1", name: "Food", userId: SEED_USER_ID, plaidId: null },
  { id: "category_2", name: "Rent", userId: SEED_USER_ID, plaidId: null },
  { id: "category_3", name: "Utilities", userId: SEED_USER_ID, plaidId: null },
  { id: "category_4", name: "Transportation", userId: SEED_USER_ID, plaidId: null },
  { id: "category_5", name: "Entertainment", userId: SEED_USER_ID, plaidId: null },
  { id: "category_6", name: "Health", userId: SEED_USER_ID, plaidId: null },
  { id: "category_7", name: "Clothing", userId: SEED_USER_ID, plaidId: null },
];

/* ----------------------------- ACCOUNTS ----------------------------- */

const SEED_ACCOUNTS = [
  { id: "account_1", name: "Checking", userId: SEED_USER_ID, plaidId: null },
  { id: "account_2", name: "Savings", userId: SEED_USER_ID, plaidId: null },
];

/* ----------------------------- DATE RANGE ----------------------------- */
/**
 * IMPORTANT:
 * We seed 60 days so:
 * - last 30 days = current period
 * - previous 30 days = last period
 */
const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 60);

/* ----------------------------- HELPERS ----------------------------- */

const convertAmountToMilliunits = (amount: number) =>
  Math.round(amount * 1000);

const generateRandomAmount = (categoryName: string) => {
  switch (categoryName) {
    case "Rent":
      return Math.random() * 400 + 900;
    case "Utilities":
      return Math.random() * 200 + 50;
    case "Food":
      return Math.random() * 30 + 10;
    case "Transportation":
    case "Health":
      return Math.random() * 50 + 15;
    case "Entertainment":
    case "Clothing":
      return Math.random() * 100 + 20;
    default:
      return Math.random() * 50 + 10;
  }
};

/* ----------------------------- TRANSACTIONS ----------------------------- */

const SEED_TRANSACTIONS: typeof transactions.$inferInsert[] = [];

const generateTransactionsForDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 4) + 1;

  for (let i = 0; i < numTransactions; i++) {
    const category =
      SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];

    // Bias slightly toward expenses (realistic)
    const isExpense = Math.random() > 0.35;

    const amount = generateRandomAmount(category.name);
    const milliunits = convertAmountToMilliunits(
      isExpense ? -amount : amount
    );

    SEED_TRANSACTIONS.push({
      id: `transaction_${format(day, "yyyy-MM-dd")}_${i}`,
      accountId: SEED_ACCOUNTS[0].id,
      categoryId: category.id,
      date: day,
      amount: milliunits,
      payee: "Merchant",
      notes: "Seeded transaction",
    });
  }
};

const generateTransactions = () => {
  const days = eachDayOfInterval({
    start: defaultFrom,
    end: defaultTo,
  });

  days.forEach(generateTransactionsForDay);
};

/* ----------------------------- MAIN ----------------------------- */

const main = async () => {
  try {
    console.log("🌱 Seeding database...");

    generateTransactions();

    // Reset tables (order matters)
    await db.delete(transactions);
    await db.delete(accounts);
    await db.delete(categories);

    // Seed base data
    await db.insert(categories).values(SEED_CATEGORIES);
    await db.insert(accounts).values(SEED_ACCOUNTS);
    await db.insert(transactions).values(SEED_TRANSACTIONS);

    console.log("✅ Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seed:", error);
    process.exit(1);
  }
};

main();
