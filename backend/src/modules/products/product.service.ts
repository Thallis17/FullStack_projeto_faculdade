import { prisma } from '../../shared/database/prisma';
import { AppError } from '../../shared/errors/AppError';
import { removeUploadedFile } from '../../shared/middlewares/upload';
import { ProductInput } from './product.schema';

const DUPLICATE_BARCODE_MESSAGE =
  'Produto com este código de barras já está cadastrado!';

export const productService = {
  async list(filters?: { search?: string; category?: string }) {
    const search = filters?.search?.trim();
    const category = filters?.category?.trim();

    return prisma.product.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { barcode: { contains: search } },
                { description: { contains: search } },
                { category: { contains: search } },
              ],
            }
          : {}),
        ...(category ? { category } : {}),
      },
      include: {
        _count: {
          select: { suppliers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        suppliers: {
          include: {
            supplier: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { suppliers: true },
        },
      },
    });

    if (!product) {
      throw new AppError('Produto não encontrado.', 404);
    }

    return product;
  },

  async create(data: ProductInput, imageUrl: string | null) {
    if (data.barcode) {
      const existing = await prisma.product.findUnique({
        where: { barcode: data.barcode },
      });

      if (existing) {
        throw new AppError(DUPLICATE_BARCODE_MESSAGE, 409, {
          barcode: DUPLICATE_BARCODE_MESSAGE,
        });
      }
    }

    return prisma.product.create({
      data: {
        name: data.name,
        barcode: data.barcode,
        description: data.description,
        stockQuantity: data.stockQuantity,
        category: data.category,
        expirationDate: data.expirationDate,
        imageUrl,
      },
    });
  },

  async update(id: number, data: ProductInput, newImageUrl: string | null) {
    const current = await this.findById(id);

    if (data.barcode) {
      const existing = await prisma.product.findFirst({
        where: {
          barcode: data.barcode,
          NOT: { id },
        },
      });

      if (existing) {
        throw new AppError(DUPLICATE_BARCODE_MESSAGE, 409, {
          barcode: DUPLICATE_BARCODE_MESSAGE,
        });
      }
    }

    let finalImageUrl = current.imageUrl;
    if (newImageUrl) {
      removeUploadedFile(current.imageUrl);
      finalImageUrl = newImageUrl;
    } else if (data.removeImage) {
      removeUploadedFile(current.imageUrl);
      finalImageUrl = null;
    }

    return prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        barcode: data.barcode,
        description: data.description,
        stockQuantity: data.stockQuantity,
        category: data.category,
        expirationDate: data.expirationDate,
        imageUrl: finalImageUrl,
      },
    });
  },

  async remove(id: number) {
    const current = await this.findById(id);
    removeUploadedFile(current.imageUrl);

    await prisma.product.delete({
      where: { id },
    });
  },
};

