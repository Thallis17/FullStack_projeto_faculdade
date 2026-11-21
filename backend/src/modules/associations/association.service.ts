import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/AppError';

const ALREADY_ASSOCIATED_MESSAGE =
  'Fornecedor já está associado a este produto!';

export const associationService = {
  async listByProduct(productId: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        suppliers: {
          include: {
            supplier: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      throw new AppError('Produto não encontrado.', 404);
    }

    return {
      product: {
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        description: product.description,
        stockQuantity: product.stockQuantity,
        category: product.category,
        expirationDate: product.expirationDate,
        imageUrl: product.imageUrl,
      },
      associatedSuppliers: product.suppliers.map((item) => ({
        associationId: item.id,
        associatedAt: item.createdAt,
        ...item.supplier,
      })),
    };
  },

  async associate(productId: number, supplierId: number) {
    const [product, supplier] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId } }),
      prisma.supplier.findUnique({ where: { id: supplierId } }),
    ]);

    if (!product) {
      throw new AppError('Produto não encontrado.', 404);
    }

    if (!supplier) {
      throw new AppError('Fornecedor não encontrado.', 404);
    }

    const existing = await prisma.productSupplier.findUnique({
      where: {
        productId_supplierId: {
          productId,
          supplierId,
        },
      },
    });

    if (existing) {
      throw new AppError(ALREADY_ASSOCIATED_MESSAGE, 409, {
        supplierId: ALREADY_ASSOCIATED_MESSAGE,
      });
    }

    return prisma.productSupplier.create({
      data: {
        productId,
        supplierId,
      },
      include: {
        supplier: true,
      },
    });
  },

  async disassociate(productId: number, supplierId: number) {
    const existing = await prisma.productSupplier.findUnique({
      where: {
        productId_supplierId: {
          productId,
          supplierId,
        },
      },
    });

    if (!existing) {
      throw new AppError('Associação não encontrada.', 404);
    }

    await prisma.productSupplier.delete({
      where: { id: existing.id },
    });
  },

  async getDashboardSummary() {
    const [totalProducts, totalSuppliers, totalAssociations, stockAggregate, recentProducts, recentSuppliers] =
      await Promise.all([
        prisma.product.count(),
        prisma.supplier.count(),
        prisma.productSupplier.count(),
        prisma.product.aggregate({
          _sum: { stockQuantity: true },
        }),
        prisma.product.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { suppliers: true } } },
        }),
        prisma.supplier.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { products: true } } },
        }),
      ]);

    return {
      metrics: {
        totalProducts,
        totalStockUnits: stockAggregate._sum.stockQuantity ?? 0,
        totalSuppliers,
        totalAssociations,
      },
      recentProducts,
      recentSuppliers,
    };
  },
};

