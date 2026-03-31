import { BadRequestException } from '@nestjs/common';

export class Email {
  private constructor(private readonly value: string) {}

  static of(raw: string): Email {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
      throw new BadRequestException(`Invalid email format: ${raw}`);
    }
    return new Email(raw.toLowerCase());
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
