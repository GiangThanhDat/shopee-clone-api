import { BadRequestException } from '@nestjs/common';

export class Quantity {
  private constructor(private readonly value: number) {}

  static of(value: number): Quantity {
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestException(
        `Quantity must be a positive integer: ${value}`,
      );
    }
    return new Quantity(value);
  }

  toNumber(): number {
    return this.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}
