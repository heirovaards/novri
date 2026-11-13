'use client';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold">Terjadi kesalahan</h1>
      <p className="text-sm text-muted-foreground">Silakan coba lagi, atau hubungi admin sistem jika berlanjut.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Coba lagi
      </button>
    </main>
  );
}
