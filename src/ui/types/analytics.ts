export interface Resumen {
  totalVotos: number;
  totalRegistros: number;
  totalMesas: number;
  totalPartidos: number;
  totalDepartamentos: number;
  votosPorAnio: { anio: number; votos: number }[];
  votosPorVuelta: { vuelta: string; votos: number }[];
}

export interface PartidoResult {
  partido: string;
  candidato: string;
  votos: number;
  porcentaje: number;
}

export interface DepartamentoResult {
  codigo: string;
  departamento: string;
  votos: number;
  porcentaje: number;
}

export interface MunicipioResult {
  codigo: string;
  municipio: string;
  departamento: string;
  votos: number;
}

export interface EvolucionItem {
  anio: number;
  partido: string;
  candidato: string;
  votos: number;
}

export interface ComparativaItem {
  anio: number;
  vuelta: string;
  partido: string;
  candidato: string;
  votos: number;
}

export interface Filtros {
  anios: number[];
  vueltas: string[];
  partidos: string[];
  departamentos: { codigo: string; nombre: string }[];
}
