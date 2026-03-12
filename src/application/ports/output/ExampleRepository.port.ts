import type { ExampleEntity } from "@domain/entities";

export interface ExampleRepository {
  findById(id: string): Promise<ExampleEntity | null>;
  findAll(): Promise<ExampleEntity[]>;
  save(entity: ExampleEntity): Promise<void>;
  delete(id: string): Promise<void>;
}
