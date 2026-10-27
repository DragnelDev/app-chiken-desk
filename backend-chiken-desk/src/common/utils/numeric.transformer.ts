import { ValueTransformer } from 'typeorm';

/** pg devuelve NUMERIC como string; lo convertimos a number en las entidades. */
export const numericTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) =>
    value === null || value === undefined ? value : parseFloat(value),
};

/** Redondeo monetario a 2 decimales (evita errores de coma flotante). */
export const round2 = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100;
