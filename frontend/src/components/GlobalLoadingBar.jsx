import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

/**
 * GlobalLoadingBar displays a top-level loading indicator for active API requests.
 */
export default function GlobalLoadingBar() {
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    const handleLoadingEvent = (event) => {
      setPendingRequests(Number(event?.detail?.count || 0));
    };

    window.addEventListener("app:loading", handleLoadingEvent);
    return () => window.removeEventListener("app:loading", handleLoadingEvent);
  }, []);

  if (pendingRequests <= 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-2 bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-lg">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      Loading...
    </div>
  );
}

