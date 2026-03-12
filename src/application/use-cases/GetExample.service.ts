import type { ExampleEntity } from "@domain/entities";
import { NotFoundError } from "@domain/errors";
import type { GetExampleUseCase } from "@application/ports/input";
import type { ExampleRepository } from "@application/ports/output";

export class GetExampleService implements GetExampleUseCase {
  constructor(private readonly repository: ExampleRepository) {}

  async execute(id: string): Promise<ExampleEntity> {
    const entity = await this.repository.findById(id);

    if (!entity) {
      throw new NotFoundError("Example", id);
    }

    return entity;
  }
}
