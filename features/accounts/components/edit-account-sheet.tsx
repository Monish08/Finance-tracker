import {
Sheet,
SheetContent,
SheetDescription,
SheetTitle,
SheetHeader
} from "@/components/ui/sheet"
import {z} from "zod"
import { Loader2 } from "lucide-react"
import { useOpenAccount } from "../hooks/use-open-account"
import { AccountForm} from "./account-form"
import { insertAccountSchema } from "@/db/schema"
import { useGetAccount } from "../api/use-get-account"
import { useEditAccount } from "../api/use-edit-account"
import { useDeleteAccount } from "../api/use-delete-account"
import { useConfirm } from "@/app/hooks/use-confirm"
const formSchema = insertAccountSchema.pick({
    name: true,
})
type FormValues = z.input<typeof formSchema>
export const EditAccountSheet = () => {
    const {isOpen,onClose, id} = useOpenAccount()


    const [ConfirmDialog, confirm] = useConfirm("Are you sure?","You are about to delete this account. This action cannot be undone.")

    const accountQuery = useGetAccount(id)
    const editMutation = useEditAccount(id)
    const deleteMutation = useDeleteAccount(id)
    const isPending = editMutation.isPending || deleteMutation.isPending
    const isLoading = accountQuery.isLoading
    const onSubmit = (values:FormValues) => {
        editMutation.mutate(values,{
            onSuccess: () => {
                onClose()
            }
        })
    }
    const defaultValues = accountQuery.data ? {
        name: accountQuery.data.name
    } : {
        name:"",
    }
    const onDelete = async () => {
        const ok = await confirm()
        if(ok)
        {
            deleteMutation.mutate(undefined,{
                onSuccess: () => {
                    onClose()
                }
            })

        }
    }
    return (
        <>
        <ConfirmDialog />
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md px-6">
                <SheetHeader>
                    <SheetTitle>Edit Account</SheetTitle>
                    <SheetDescription>
                        Update your account details.
                    </SheetDescription>
                </SheetHeader>
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="size-4 text-muted-foreground animate-spin"/>
                    </div>
                ) : (
                    <AccountForm id={id} onSubmit={onSubmit} disabled={isPending} defaultValues={defaultValues} onDelete={onDelete}/>
                )}

                </SheetContent>
            </Sheet>
            </>
    )
}