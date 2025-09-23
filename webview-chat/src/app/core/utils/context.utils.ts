export function ToHumanReadable(ctx_number: number): string {
  switch (true) {
    // case ctx_number >= 1_000_000_000:
    //   return (ctx_number / 1_000_000_000).toFixed(ctx_number % 1_000_000_000 === 0 ? 0 : 1) + "B";

    case ctx_number >= 1_000_000:
      return (ctx_number / 1_000_000).toFixed(ctx_number % 1_000_000 === 0 ? 0 : 1) + "M";

    case ctx_number >= 1_000:
      return (ctx_number / 1_000).toFixed(ctx_number % 1_000 === 0 ? 0 : 1) + "K";

    default:
      return ctx_number.toString();
  }
}

export function formatContextUsage(typed: number, total: number): string {
  const remaining = Math.max(total - typed, 0);
  return `${ToHumanReadable(remaining)}/${ToHumanReadable(total)}`;
}
