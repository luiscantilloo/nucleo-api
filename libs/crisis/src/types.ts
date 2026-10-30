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
