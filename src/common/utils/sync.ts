import { BadRequestException } from '@nestjs/common';

export function findIdsToRemove(
  existing: { id: number }[],
  incoming: { id?: number }[],
): number[] {
  const incomingIds = new Set(
    incoming.filter((i) => i.id).map((i) => Number(i.id)),
  );
  return existing.map((e) => Number(e.id)).filter((id) => !incomingIds.has(id));
}

// Updates are keyed by client-sent ids, so an id outside the parent's rows would overwrite another owner's data
export function rejectForeignIds(
  existing: { id: number }[],
  incoming: { id?: number }[],
): void {
  const existingIds = new Set(existing.map((e) => Number(e.id)));
  const foreignIds = incoming
    .filter((i) => i.id && !existingIds.has(Number(i.id)))
    .map((i) => Number(i.id));
  if (foreignIds.length > 0) {
    throw new BadRequestException(
      `Items ${foreignIds.join(', ')} do not belong to this resource`,
    );
  }
}
