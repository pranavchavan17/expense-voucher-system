import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import { CalendarDays, FileText, IndianRupee, ListTree, NotebookTabs, TextCursorInput, Wallet } from "lucide-react";

/**
 * VoucherFormFields renders the shared voucher form fields for create and edit flows.
 */
export default function VoucherFormFields({ register, errors, disabled = false }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Input
        label="Voucher Date"
        type="date"
        disabled={disabled}
        icon={<CalendarDays className="h-4 w-4" />}
        error={errors.voucherDate?.message}
        {...register("voucherDate", {
          required: "Voucher date is required."
        })}
      />

      <Input
        label="Expense Date"
        type="date"
        disabled={disabled}
        icon={<CalendarDays className="h-4 w-4" />}
        error={errors.expenseDate?.message}
        {...register("expenseDate", {
          required: "Expense date is required."
        })}
      />

      <Input
        label="Department"
        disabled={disabled}
        icon={<ListTree className="h-4 w-4" />}
        error={errors.department?.message}
        {...register("department", {
          required: "Department is required.",
          minLength: {
            value: 1,
            message: "Department is required."
          }
        })}
      />

      <Input
        label="Expense Title"
        disabled={disabled}
        icon={<NotebookTabs className="h-4 w-4" />}
        error={errors.expenseTitle?.message}
        {...register("expenseTitle", {
          required: "Expense title is required.",
          minLength: {
            value: 1,
            message: "Expense title is required."
          }
        })}
      />

      <Input
        label="Expense Category"
        disabled={disabled}
        icon={<FileText className="h-4 w-4" />}
        error={errors.expenseCategory?.message}
        {...register("expenseCategory", {
          required: "Expense category is required.",
          minLength: {
            value: 1,
            message: "Expense category is required."
          }
        })}
      />

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0.01"
        disabled={disabled}
        icon={<IndianRupee className="h-4 w-4" />}
        error={errors.amount?.message}
        {...register("amount", {
          required: "Amount is required.",
          valueAsNumber: true,
          min: {
            value: 0.01,
            message: "Amount must be greater than zero."
          }
        })}
      />

      <Textarea
        label="Expense Description"
        rows={5}
        disabled={disabled}
        wrapperClassName="md:col-span-2"
        className="resize-y"
        error={errors.expenseDescription?.message}
        {...register("expenseDescription", {
          required: "Expense description is required.",
          minLength: {
            value: 1,
            message: "Expense description is required."
          }
        })}
      />
    </div>
  );
}

