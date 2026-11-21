import { z } from 'zod';
import { formatCnpj, formatPhone, onlyDigits } from '../../shared/utils/formatters';

export const supplierSchema = z.object({
  companyName: z
    .string({ required_error: 'O nome da empresa é obrigatório.' })
    .trim()
    .min(1, 'O nome da empresa é obrigatório.')
    .min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.'),
  cnpj: z
    .string({ required_error: 'O CNPJ é obrigatório.' })
    .trim()
    .min(1, 'O CNPJ é obrigatório.')
    .refine((val) => onlyDigits(val).length === 14, {
      message: 'Informe um CNPJ válido no formato 00.000.000/0000-00.',
    })
    .transform((val) => formatCnpj(val)),
  address: z
    .string({ required_error: 'O endereço é obrigatório.' })
    .trim()
    .min(1, 'O endereço é obrigatório.')
    .min(5, 'Informe o endereço completo da empresa.'),
  phone: z
    .string({ required_error: 'O telefone é obrigatório.' })
    .trim()
    .min(1, 'O telefone é obrigatório.')
    .refine(
      (val) => {
        const len = onlyDigits(val).length;
        return len === 10 || len === 11;
      },
      {
        message: 'Informe um telefone válido com DDD, ex.: (00) 0000-0000.',
      }
    )
    .transform((val) => formatPhone(val)),
  email: z
    .string({ required_error: 'O e-mail é obrigatório.' })
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('Informe um endereço de e-mail válido.')
    .transform((val) => val.toLowerCase()),
  mainContact: z
    .string({ required_error: 'O contato principal é obrigatório.' })
    .trim()
    .min(1, 'O contato principal é obrigatório.')
    .min(2, 'O nome do contato principal deve ter pelo menos 2 caracteres.'),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

