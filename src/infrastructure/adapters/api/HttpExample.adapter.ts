import type { ExampleEntity } from "@domain/entities";
import type { ExampleRepository } from "@application/ports/output";
import { ExampleMapper } from "@infrastructure/adapters/mappers";
import { httpClient } from "@infrastructure/config/httpClient";

export class HttpExampleRepository implements ExampleRepository {
  private readonly basePath = "/examples";

  async findById(id: string): Promise<ExampleEntity | null> {
    try {
      const response = await httpClient.get(`${this.basePath}/${id}`);
      return ExampleMapper.toDomain(response);
    } catch {
      return null;
    }
  }

  async findAll(): Promise<ExampleEntity[]> {
    const response = await httpClient.get<unknown[]>(this.basePath);
    return response.map(ExampleMapper.toDomain);
  }

  async save(entity: ExampleEntity): Promise<void> {
    const dto = ExampleMapper.toDTO(entity);
    await httpClient.post(this.basePath, dto);
  }

  async delete(id: string): Promise<void> {
    await httpClient.delete(`${this.basePath}/${id}`);
  }
}
