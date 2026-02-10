"use client";

import { ReactNode } from "react";
import { NewAccountSheet } from "@/features/accounts/components/new-account-sheet";
import { EditAccountSheet } from "@/features/accounts/components/edit-account-sheet";

import { NewCategorySheet } from "@/features/categories/components/new-category-sheet"
import { EditCategorySheet } from "@/features/categories/components/edit-category-sheet";

import { NewTransactionSheet } from "@/features/transactions/components/new-transaction-sheet";
import { EditTransactionSheet } from "@/features/transactions/components/edit-transaction-sheet";
type SheetProviderProps = {
  children: ReactNode;
};

export const SheetProvider = ({ children }: SheetProviderProps) => {

  return (
    <>
      {children}
      <NewAccountSheet />
      <EditAccountSheet />

      <NewCategorySheet/>
      <EditCategorySheet/>

      <NewTransactionSheet />
      <EditTransactionSheet />
    </>
  );
};
