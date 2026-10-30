export type ProgramId = string;

export type CrisisCategoria = {
  frases?: string[];
  eventos?: string[];
  avisar: string[];
  plazo_min?: number;
  pausar?: boolean;
  ruta_obligatoria?: string;
};

export type ProgramCrisis = {
  version?: string;
  bloqueadas: Array<{
    instrumento: string;
    pregunta: number;
    si: string;
    categoria: string;
    editable?: boolean;
  }>;
  categorias: Record<string, CrisisCategoria>;
  texto: Record<string, string>;
};

export type ProgramRole = {
  id: string;
  nombre: string;
  base?: string;
  ve?: string[];
  no_ve?: string[];
};

export type ProgramConfig = {
  id: string;
  nombre: string;
  version: string;
  crisis: ProgramCrisis;
  roles: ProgramRole[];
  perfiles: unknown;
  rutas: unknown;
  servicios: unknown;
  marca: unknown;
  textos: unknown;
  instrumentos: Record<string, unknown>;
  promptTeo: string;
  rootDir: string;
};
