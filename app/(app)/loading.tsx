export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-11 w-full animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    </div>
  );
}
