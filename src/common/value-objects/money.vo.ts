import { BadRequestException } from '@nestjs/common';

export class Money {
  private constructor(private readonly amount: number) {}

  static of(value: number): Money {
    if (value < 0) {
      throw new BadRequestException(`Money amount cannot be negative: ${value}`);
    }
    return new Money(value);
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor);
  }

  applyDiscount(percent: number): Money {
    return new Money(this.amount * (1 - percent / 100));
  }

  toNumber(): number {
    return this.amount;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}
