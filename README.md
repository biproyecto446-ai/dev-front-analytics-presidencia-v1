# Analytics Presidencia Colombia

Plataforma de análisis estadístico y comparativo de resultados electorales presidenciales de Colombia. Construida con **Next.js 16**, **TypeScript**, **Tailwind CSS 4** y **Recharts**, siguiendo una **Arquitectura Hexagonal** (frontend-only).

---

## Requisitos previos

- **Node.js** >= 18.x
- **npm** >= 9.x
- Acceso a una base de datos **PostgreSQL** con el schema `report`

## Instalación

```bash
# Clonar e instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con las credenciales de la base de datos
```

> **Nota:** Si la contraseña contiene el carácter `$`, usar comillas dobles y escapar con `\$`:
> ```
> DB_PASSWORD="mi\$password"
> ```

## Ejecución

```bash
# Desarrollo
npm run dev          # http://localhost:3000

# Producción
npm run build
npm run start

# Linter
npm run lint
```

---

## Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.1.6 | Framework React con App Router |
| React | 19.x | Librería UI |
| TypeScript | 5.x | Tipado estático |
| Tailwind CSS | 4.x | Estilos utilitarios |
| Recharts | 3.x | Gráficos (barras, líneas, torta) |
| pg (node-postgres) | 8.x | Conexión PostgreSQL |

---

## Arquitectura hexagonal

```
src/
├── app/                              # Next.js App Router (entry point)
│   ├── layout.tsx                    #   Layout raíz
│   ├── page.tsx                      #   Dashboard principal
│   ├── globals.css                   #   Tema dark + variables CSS
│   └── api/                          #   API Routes
│       ├── health/                   #     Health check DB
│       ├── tables/                   #     Listar tablas / consultar tabla
│       ├── query/                    #     SQL libre (solo SELECT)
│       └── analytics/                #     Endpoints analíticos
│           ├── resumen/              #       KPIs generales
│           ├── filtros/              #       Valores para filtros
│           ├── partidos/             #       Votos por partido/candidato
│           ├── departamentos/        #       Votos por departamento
│           ├── municipios/           #       Votos por municipio
│           ├── evolucion/            #       Evolución histórica
│           ├── comparativa-vueltas/  #       1ra vs 2da vuelta
│           ├── comparativo-anios/    #       Comparativo entre elecciones
│           ├── top-departamentos/    #       Ranking departamentos + ganador
│           ├── top-municipios/       #       Ranking municipios + ganador
│           ├── dominancia/           #       Dominancia regional
│           ├── concentracion/        #       Índice HHI de concentración
│           ├── candidatos/           #       Lista de candidatos
│           └── head-to-head/         #       Comparación 1 vs 1
│
├── domain/                           # CAPA DE DOMINIO (pura, sin dependencias)
│   ├── entities/                     #   Entidades del negocio
│   ├── value-objects/                #   Objetos de valor
│   └── errors/                       #   Errores de dominio
│
├── application/                      # CAPA DE APLICACIÓN (casos de uso)
│   ├── ports/
│   │   ├── input/                    #   Interfaces de casos de uso
│   │   └── output/                   #   Interfaces de repositorios
│   ├── use-cases/                    #   Implementación de casos de uso
│   └── dtos/                         #   Data Transfer Objects
│
├── infrastructure/                   # CAPA DE INFRAESTRUCTURA (adaptadores)
│   ├── adapters/
│   │   ├── api/                      #   Adaptadores HTTP
│   │   └── mappers/                  #   Mappers dominio ↔ DTO
│   └── config/
│       ├── database.ts               #   Pool PostgreSQL + helper query()
│       └── httpClient.ts             #   Cliente HTTP genérico
│
└── ui/                               # CAPA DE PRESENTACIÓN
    ├── components/
    │   ├── atoms/                    #   Card, StatCard, Select, Spinner, Button
    │   ├── molecules/                #   (reservado)
    │   └── organisms/                #   Charts, Tablas, Comparativos, HeadToHead
    ├── hooks/                        #   useFetch, buildUrl, useExample
    ├── types/                        #   Tipos compartidos de analytics
    ├── contexts/                     #   (reservado)
    └── layouts/                      #   (reservado)
```

### Regla de dependencias

```
UI → Application → Domain ← Infrastructure
```

- **Domain**: sin dependencias externas (puro)
- **Application**: depende solo de Domain
- **Infrastructure**: implementa puertos de Application
- **UI**: consume use cases de Application

### Path aliases (tsconfig.json)

| Alias | Ruta |
|---|---|
| `@/*` | `./src/*` |
| `@domain/*` | `./src/domain/*` |
| `@application/*` | `./src/application/*` |
| `@infrastructure/*` | `./src/infrastructure/*` |
| `@ui/*` | `./src/ui/*` |

---

## Base de datos

### Schema: `report`

#### `divi_departamentos`
| Columna | Tipo | PK |
|---|---|---|
| codigo_departamento | varchar(2) | Si |
| nombre | varchar(100) | |

#### `divi_municipio`
| Columna | Tipo | PK |
|---|---|---|
| codigo_divipole | text | Si |
| codigo_departamento | varchar(2) | |
| codigo_municipio | varchar(3) | |
| des_municipio | varchar(150) | |

#### `presidencia_resultados`
| Columna | Tipo | PK |
|---|---|---|
| id | bigserial | Si |
| anio_eleccion | smallint | |
| corporacion | text | |
| circunscripcion | text | |
| codigo_departamento | char(2) | |
| codigo_divipole | char(5) | |
| nombre_puesto | text | |
| mesa | text | |
| votos | integer | |
| codigo_partido | text | |
| partido | text | |
| codigo_candidato | text | |
| nombre_candidato | text | |
| origen | text | |

### Relaciones

```
divi_departamentos.codigo_departamento ──── divi_municipio.codigo_departamento
divi_municipio.codigo_divipole ──────────── presidencia_resultados.codigo_divipole
divi_departamentos.codigo_departamento ──── presidencia_resultados.codigo_departamento
```

---

## API Endpoints

### Utilidades

| Endpoint | Método | Descripción |
|---|---|---|
| `/api/health` | GET | Verifica conexión a la DB |
| `/api/tables` | GET | Lista tablas del schema |
| `/api/tables/[name]?limit=N&offset=N` | GET | Datos de una tabla |
| `/api/query` | POST | Ejecuta SELECT personalizado `{ sql, params }` |

### Analytics

| Endpoint | Método | Filtros | Descripción |
|---|---|---|---|
| `/api/analytics/resumen` | GET | — | KPIs: total votos, registros, mesas, partidos, departamentos |
| `/api/analytics/filtros` | GET | — | Valores disponibles para filtros (años, vueltas, partidos, depts) |
| `/api/analytics/partidos` | GET | `anio`, `vuelta` | Votos y % por partido/candidato |
| `/api/analytics/departamentos` | GET | `anio`, `vuelta`, `partido` | Votos y % por departamento |
| `/api/analytics/municipios` | GET | `anio`, `vuelta`, `departamento`, `partido`, `limit` | Votos por municipio |
| `/api/analytics/evolucion` | GET | `vuelta`, `departamento`, `top` | Evolución histórica top N partidos |
| `/api/analytics/comparativa-vueltas` | GET | `anio` | 1ra vs 2da vuelta por candidato |
| `/api/analytics/comparativo-anios` | GET | `vuelta`, `departamento` | Ganadores y márgenes entre elecciones |
| `/api/analytics/top-departamentos` | GET | `anio`, `vuelta`, `limit` | Ranking departamentos con ganador |
| `/api/analytics/top-municipios` | GET | `anio`, `vuelta`, `departamento`, `limit` | Ranking municipios con ganador |
| `/api/analytics/dominancia` | GET | `anio`, `vuelta` | Dominancia partidaria por departamento |
| `/api/analytics/concentracion` | GET | `anio`, `vuelta` | Índice HHI de concentración del voto |
| `/api/analytics/candidatos` | GET | `anio`, `vuelta` | Lista de candidatos (para selector H2H) |
| `/api/analytics/head-to-head` | GET | `anio`, `vuelta`, `candidato1`, `candidato2` | Comparación 1v1 por departamento |

---

## Dashboard - Secciones de análisis

| Sección | Descripción |
|---|---|
| **Resumen** | KPIs, participación por año/vuelta, distribución por candidato (torta + barras), top 10 departamentos |
| **Partidos** | Barras horizontales por candidato, torta porcentual, tabla detallada con % |
| **Departamentos** | Barras por departamento, ranking con ganador, mesas y % de dominancia |
| **Municipios** | Top 50 municipios con ganador, partido y % por municipio |
| **Evolución** | Gráfico de líneas: evolución de votos top 8 partidos entre elecciones |
| **1ra vs 2da** | Barras agrupadas: comparación primera y segunda vuelta |
| **Comparativo** | Cards por elección: 1er y 2do lugar, margen de victoria, total candidatos |
| **Dominancia** | Tabla: partido dominante por departamento, margen, índice de competitividad |
| **Concentración** | Tabla: índice HHI, dispersión geográfica, departamento de mayor presencia |
| **Head to Head** | Selector de 2 candidatos, cards de resumen, barras comparativas por departamento |

---

## Diseño UI

- **Tema dark** profesional con palette slate/blue
- **Sidebar** fijo con navegación por secciones
- **Header sticky** con título dinámico + contador de filtros activos
- **Glassmorphism** en cards (backdrop-blur + bordes semitransparentes)
- **Recharts** estilizado para dark mode (tooltips, grids, ejes)
- **Badges semánticos** de color para competitividad y concentración
- **Responsive** con grid adaptativo

---

## Licencia

ISC
