import { z } from 'zod';

export const associateSupplierSchema = z.object({
  supplierId: z.coerce
    .number({ invalid_type_error: 'Selecione um fornecedor válido.' })
    .int('Selecione um fornecedor válido.')
    .positive('Selecione um fornecedor.'),
});

export type AssociateSupplierInput = z.infer<typeof associateSupplierSchema>;

