import { LoaderCircle } from "lucide-react";

/**
 * LoadingSpinner is a simple inline activity indicator.
 */
export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      {label}
    </span>
  );
}
