import type { ExampleEntity } from "@domain/entities";

export interface GetExampleUseCase {
  execute(id: string): Promise<ExampleEntity>;
}
