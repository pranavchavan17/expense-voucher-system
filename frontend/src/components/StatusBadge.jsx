import { getVoucherStatusMeta } from "@/utils/voucherUtils";

/**
 * StatusBadge renders the workflow state with consistent semantic colors.
 */
export default function StatusBadge({ status }) {
  const meta = getVoucherStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

