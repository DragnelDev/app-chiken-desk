import { numericTransformer, round2 } from './numeric.transformer';

describe('numeric.transformer', () => {
  it('convierte NUMERIC (string) a number y respeta null', () => {
    expect(numericTransformer.from('12.50')).toBe(12.5);
    expect(numericTransformer.from(null)).toBeNull();
  });

  it('round2 evita errores de coma flotante', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(3 * 25.9)).toBe(77.7);
  });
});
