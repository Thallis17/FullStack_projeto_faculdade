import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { productRawSchema } from './product.schema';
import { productService } from './product.service';

function parseId(rawId: string | undefined): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Identificador de produto inválido.', 400);
  }
  return id;
}

export const productController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const products = await productService.list({ search, category });
      res.json({ data: products });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const product = await productService.findById(id);
      res.json({ data: product });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = productRawSchema.parse(req.body);
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const product = await productService.create(parsed, imageUrl);

      res.status(201).json({
        message: 'Produto cadastrado com sucesso!',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const parsed = productRawSchema.parse(req.body);
      const newImageUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const product = await productService.update(id, parsed, newImageUrl);

      res.json({
        message: 'Produto atualizado com sucesso!',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      await productService.remove(id);
      res.json({
        message: 'Produto excluído com sucesso!',
      });
    } catch (error) {
      next(error);
    }
  },
};

