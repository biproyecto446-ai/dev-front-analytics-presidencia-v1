"use client";

import { useState, useEffect, useCallback } from "react";
import type { ExampleEntity } from "@domain/entities";
import type { GetExampleUseCase } from "@application/ports/input";

interface UseExampleReturn {
  data: ExampleEntity | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExample(
  useCase: GetExampleUseCase,
  id: string
): UseExampleReturn {
  const [data, setData] = useState<ExampleEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await useCase.execute(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [useCase, id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
