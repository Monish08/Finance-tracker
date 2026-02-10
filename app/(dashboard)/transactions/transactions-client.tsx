"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import {ImportCard} from "./import-card"
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "@/components/data-table";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions"
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { UploadButton} from "./upload-button";
import {transactions as transactionSchema} from "@/db/schema"
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
enum VARIANTS{
  LIST="LIST",
  IMPORT="IMPORT"
}
const INITIAL_IMPORT_RESULTS = {
  data:[],
  errors:[],
  meta:{}
}

export default function TransactionPage() {
  const [AccountDialog,confirm] = useSelectAccount()
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST)
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS)
  const onUpload = (results:typeof INITIAL_IMPORT_RESULTS) => {
    console.log({results})
    setImportResults(results);
    setVariant(VARIANTS.IMPORT)
  }
  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST)
  }
  const newTransaction = useNewTransaction();
  const createTransactions = useBulkCreateTransactions()
  const transactionsQuery = useGetTransactions();
  const transactions = transactionsQuery.data || [];
  const deleteTransactions = useBulkDeleteTransactions()
  const isDisabled = transactionsQuery.isLoading || deleteTransactions.isPending

  const onSubmitImport = async (values:typeof transactionSchema.$inferInsert[],
  ) => {
    const accountId = await confirm();
    if(!accountId)
    {
      return toast.error("Please select an account to continue.")
    }
    const data = values.map((value)=>({
      ...value,
      accountId:accountId as string
    }))
    createTransactions.mutate(data,{
      onSuccess:()=>{
        onCancelImport();
      }
    })
  }

  if(transactionsQuery.isLoading){
    return (<div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader >
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="h-[500px] w-full flex items-center justify-center">
            <Loader2 className="size-6 text-slate-300 animate-spin"/>
          </div>
          </CardContent>
      </Card>
    </div>)
  }
  if(variant === VARIANTS.IMPORT){
    return (
      <>
      <AccountDialog />
      <ImportCard
      data={importResults.data}
      onCancel={onCancelImport}
      onSubmit={onSubmitImport}
      />
      </>
    )}
  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Transaction History</CardTitle>

         <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
           <Button size="sm" onClick={newTransaction.onOpen} className="w-full lg:w-auto">
            <Plus className="size-4 mr-2" />
            Add new
          </Button>
          <UploadButton
          onUpload={onUpload}
          />
         </div>

        </CardHeader>
        <CardContent>
        <DataTable filterKey="payee" columns={columns} data={transactions} onDelete={(row)=>{
          const ids = row.map(r => r.original.id);
          deleteTransactions.mutate({ids})
        }} disabled={isDisabled}/>
        </CardContent>
      </Card>
    </div>
  );
}
