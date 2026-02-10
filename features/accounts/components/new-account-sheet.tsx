import {
Sheet,
SheetContent,
SheetDescription,
SheetTitle,
SheetHeader
} from "@/components/ui/sheet"
import {z} from "zod"
import { useNewAccount } from "../hooks/use-new-account"
import { AccountForm} from "./account-form"
import { insertAccountSchema } from "@/db/schema"
import { useCreateAccount } from "../api/use-create-account"
const formSchema = insertAccountSchema.pick({
    name: true,
})
type FormValues = z.input<typeof formSchema>
export const NewAccountSheet = () => {
    const {isOpen,onClose} = useNewAccount()
    const mutation = useCreateAccount()
    const onSubmit = (values:FormValues) => {
        mutation.mutate(values,{
            onSuccess: () => {
                onClose()
            }
        })
    }

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="w-full sm:max-w-md px-6">
                <SheetHeader>
                    <SheetTitle>New Account</SheetTitle>
                    <SheetDescription>
                        Create a new account to track your finances.
                    </SheetDescription>
                </SheetHeader>
                <AccountForm onSubmit={onSubmit} disabled={mutation.isPending} defaultValues={{
                    name:""
                }}/>
                </SheetContent>
            </Sheet>
    )
}