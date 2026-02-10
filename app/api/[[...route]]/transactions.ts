import { db, sql } from "@/db/drizzle";
import {  accounts, categories, insertTransactionSchema, transactions} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import {  inArray, and, lte,gte ,desc, eq,exists} from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { Hono } from "hono";
import {parse, subDays} from "date-fns"
import {  z } from "zod";
import { zValidator } from "@hono/zod-validator";
const app = new Hono()
  .get("/",
    zValidator("query", z.object({
      from:z.string().optional(),
      to:z.string().optional(),
      accountId:z.string().optional(),
    }))
    , clerkMiddleware(), async (c) => {
    const auth = getAuth(c);
    const { from, to, accountId } = c.req.valid("query");
    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const defaultTo = new Date();
    const defaultFrom = subDays(defaultTo, 30);
    const startDate = from  ? parse(from,"yyyy-MM-dd", new Date()) : defaultFrom;
    const endDate = to ? parse(to,"yyyy-MM-dd", new Date()) : defaultTo;
    const data = await db
      .select({
        id: transactions.id,
        date: transactions.date,
        category:categories.name,
        categoryId: transactions.categoryId,
        amount:transactions.amount,
        notes:transactions.notes,
        payee: transactions.payee,
        accountId: transactions.accountId,
        account:accounts.name,
      })
      .from(transactions)
      .innerJoin(accounts, eq(transactions.accountId, accounts.id))
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(and(accountId ? eq(transactions.accountId, accountId) : undefined,
    eq(accounts.userId, auth.userId),
    gte(transactions.date, startDate),
    lte(transactions.date, endDate)
  )).orderBy(desc(transactions.date))
    return c.json({ data });
  })
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c);
      const { id } = c.req.valid("param");
      if (!id) {
        return c.json({ error: "ID is required" }, 400);
      }
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const [data] = await db
        .select({
          id: transactions.id,
        date: transactions.date,
        categoryId: transactions.categoryId,
        amount:transactions.amount,
        notes:transactions.notes,
        accountId: transactions.accountId,
        payee: transactions.payee,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id,id), eq(accounts.userId, auth.userId)));
      if (!data) {
        return c.json({ error: "Account not found" }, 404);
      }
      return c.json({ data });
    },
  )

  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionSchema.omit({
      id: true,
    })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();
      return c.json({ data });
    },
  )
  .post("/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      const data = await db
        .insert(transactions)
        .values(values.map((value) => ({ id: createId(), ...value })))
        .returning();
      return c.json({ data });
    })
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (c) => {
      const auth = getAuth(c);
      const values = c.req.valid("json");
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }
  
      const data = await db
      .delete(transactions)
  .where(
  and(
    inArray(transactions.id, values.ids),
    exists(
      db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.id, transactions.accountId),
            eq(accounts.userId, auth.userId)
          )
        )
    )
  )
)  .returning({ id: transactions.id });
      return c.json({ data });
    },
  )
  .patch("/:id",clerkMiddleware(),zValidator("param", z.object({ id: z.string().optional() })), zValidator("json", insertTransactionSchema.omit({ id: true })), async (c) => {
    const auth = getAuth(c);
    const { id } = c.req.valid("param");
    const values = c.req.valid("json");
    if (!id) {
      return c.json({ error: "ID is required" }, 400);
    }
    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);  
    }
    const [data] = await db
   .update(transactions)
  .set(values)
  .where(
  and(
    eq(transactions.id, id),
    exists(
      db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.id, transactions.accountId),
            eq(accounts.userId, auth.userId)
          )
        )
    )
  )
)

  .returning();
      
    if (!data) {
      return c.json({ error: "Account not found" }, 404);
    }
    return c.json({ data });
}
  )
  .delete("/:id",clerkMiddleware(),zValidator("param", z.object({ id: z.string().optional() })), async (c) => {
    const auth = getAuth(c);
    const { id } = c.req.valid("param");
    if (!id) {
      return c.json({ error: "ID is required" }, 400);
    }
    if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401);  
    }


      const [data] = await db
  .delete(transactions)
  .where(
  and(
    eq(transactions.id, id),
    exists(
      db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.id, transactions.accountId),
            eq(accounts.userId, auth.userId)
          )
        )
    )
  )
)

  .returning({ id: transactions.id });
    if (!data) {
      return c.json({ error: "Transaction not found" }, 404);
    }
    return c.json({ data });
}
  )
export default app;
