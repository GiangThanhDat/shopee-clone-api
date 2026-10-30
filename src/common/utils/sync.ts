export function findIdsToRemove(
  existing: { id: number }[],
  incoming: { id?: number }[],
): number[] {
  const incomingIds = new Set(
    incoming.filter((i) => i.id).map((i) => Number(i.id)),
  );
  return existing.map((e) => Number(e.id)).filter((id) => !incomingIds.has(id));
}
