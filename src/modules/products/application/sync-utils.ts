export function findIdsToRemove(
  existing: { id: number }[],
  incoming: { id?: number }[],
): number[] {
  const existingIds = existing.map((e) => Number(e.id));
  const incomingIds = incoming.filter((i) => i.id).map((i) => Number(i.id));
  return existingIds.filter((id) => !incomingIds.includes(id));
}
