type Params = { wallet: string };

export default async function TracePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { wallet } = await params;

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-wider">
            Tracing
          </p>
          <h1 className="font-mono text-lg break-all">{wallet}</h1>
        </header>

        <section className="border-border rounded-lg border p-12 text-center">
          <p className="text-muted-foreground text-sm">
            Trace graph + AI narrative will render here.
          </p>
        </section>
      </div>
    </main>
  );
}
