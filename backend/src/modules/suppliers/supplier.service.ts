import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { SupplierInput } from './supplier.schema';

const DUPLICATE_CNPJ_MESSAGE = 'Fornecedor com esse CNPJ já está cadastrado!';

export const supplierService = {
  async list(search?: string) {
    const query = search?.trim();

    return prisma.supplier.findMany({
      where: query
        ? {
            OR: [
              { companyName: { contains: query } },
              { cnpj: { contains: query } },
              { email: { contains: query } },
              { mainContact: { contains: query } },
            ],
          }
        : undefined,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!supplier) {
      throw new AppError('Fornecedor não encontrado.', 404);
    }

    return supplier;
  },

  async create(data: SupplierInput) {
    const existing = await prisma.supplier.findUnique({
      where: { cnpj: data.cnpj },
    });

    if (existing) {
      throw new AppError(DUPLICATE_CNPJ_MESSAGE, 409, {
        cnpj: DUPLICATE_CNPJ_MESSAGE,
      });
    }

    return prisma.supplier.create({
      data,
    });
  },

  async update(id: number, data: SupplierInput) {
    await this.findById(id);

    const existing = await prisma.supplier.findFirst({
      where: {
        cnpj: data.cnpj,
        NOT: { id },
      },
    });

    if (existing) {
      throw new AppError(DUPLICATE_CNPJ_MESSAGE, 409, {
        cnpj: DUPLICATE_CNPJ_MESSAGE,
      });
    }

    return prisma.supplier.update({
      where: { id },
      data,
    });
  },

  async remove(id: number) {
    await this.findById(id);

    await prisma.supplier.delete({
      where: { id },
    });
  },
};

