import EmptyState from "@/components/EmptyState";

/**
 * NotFoundPage renders a simple 404 placeholder.
 */
export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4">
      <div className="w-full">
        <EmptyState title="404 Page" description="The page you are looking for does not exist." />
      </div>
    </div>
  );
}
