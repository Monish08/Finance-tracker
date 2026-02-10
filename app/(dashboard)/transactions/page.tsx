import { Suspense } from "react";
import TransactionPage from "./transactions-client";

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="h-40" />}>
      <TransactionPage />
    </Suspense>
  );
}
