type ActionGuidanceProps = {
  actions: string[];
};

export function ActionGuidance({ actions }: ActionGuidanceProps) {
  if (!actions.length) return null;

  return (
    <section className="surface-card rounded-2xl p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
        What I&apos;d do next
      </h3>
      <ul className="mt-3 space-y-2">
        {actions.map((action) => (
          <li key={action} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
            <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-indigo-500" aria-hidden />
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
