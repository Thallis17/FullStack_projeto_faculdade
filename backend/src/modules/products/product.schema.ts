import { z } from 'zod';

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const productRawSchema = z
  .object({
    name: z
      .string({ required_error: 'O nome do produto é obrigatório.' })
      .trim()
      .min(1, 'O nome do produto é obrigatório.')
      .min(2, 'O nome do produto deve ter pelo menos 2 caracteres.'),
    barcode: z
      .string()
      .optional()
      .transform((val) => {
        const trimmed = val?.trim() ?? '';
        return trimmed === '' ? null : trimmed;
      })
      .refine((val) => val === null || /^\d+$/.test(val), {
        message: 'O código de barras deve conter apenas números.',
      }),
    description: z
      .string({ required_error: 'A descrição do produto é obrigatória.' })
      .trim()
      .min(1, 'A descrição do produto é obrigatória.')
      .min(3, 'A descrição deve ter pelo menos 3 caracteres.'),
    stockQuantity: z
      .union([z.string(), z.number()])
      .optional()
      .transform((val) => {
        if (val === undefined || val === null) return 0;
        if (typeof val === 'string') {
          const trimmed = val.trim();
          if (trimmed === '') return 0;
          if (!/^-?\d+$/.test(trimmed)) return Number.NaN;
          return Number(trimmed);
        }
        return val;
      })
      .refine((val) => Number.isInteger(val) && val >= 0, {
        message: 'A quantidade em estoque deve ser um número inteiro maior ou igual a zero.',
      }),
    category: z
      .string({ required_error: 'A categoria é obrigatória.' })
      .trim()
      .min(1, 'Selecione uma categoria.'),
    customCategory: z
      .string()
      .optional()
      .transform((val) => val?.trim() ?? ''),
    expirationDate: z
      .string()
      .optional()
      .transform((val) => {
        const trimmed = val?.trim() ?? '';
        return trimmed === '' ? null : trimmed;
      })
      .refine((val) => val === null || isValidIsoDate(val), {
        message: 'Informe uma data de validade válida.',
      }),
    removeImage: z
      .union([z.boolean(), z.string()])
      .optional()
      .transform((val) => val === true || val === 'true'),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'Outro' && !data.customCategory) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['customCategory'],
        message: 'Especifique a categoria do produto.',
      });
    }
  })
  .transform((data) => ({
    name: data.name,
    barcode: data.barcode,
    description: data.description,
    stockQuantity: data.stockQuantity,
    category: data.category === 'Outro' ? data.customCategory : data.category,
    expirationDate: data.expirationDate,
    removeImage: data.removeImage,
  }));

export type ProductInput = z.infer<typeof productRawSchema>;

