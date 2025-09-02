"use client"
export default function Error({ error, reset }) {
  return (
    <div className="px-6 py-10 md:px-20 lg:px-32">
      <h2 className="text-xl mb-2">Something went wrong</h2>
      {error?.message && <p className="text-sm text-muted-foreground mb-4">{error.message}</p>}
      <button className="underline" onClick={() => reset()}>Try again</button>
    </div>
  );
}


