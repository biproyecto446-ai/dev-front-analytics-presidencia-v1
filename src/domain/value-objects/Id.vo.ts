export class Id {
  constructor(private readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("Id cannot be empty");
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Id): boolean {
    return this.value === other.value;
  }
}
