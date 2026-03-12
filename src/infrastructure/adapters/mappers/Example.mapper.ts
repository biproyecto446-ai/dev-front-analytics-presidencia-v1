import type { ExampleEntity } from "@domain/entities";
import type { ExampleDTO } from "@application/dtos";

export class ExampleMapper {
  static toDomain(raw: unknown): ExampleEntity {
    const data = raw as ExampleDTO;
    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.createdAt),
    };
  }

  static toDTO(entity: ExampleEntity): ExampleDTO {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
