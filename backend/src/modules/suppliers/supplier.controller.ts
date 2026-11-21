import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { supplierSchema } from './supplier.schema';
import { supplierService } from './supplier.service';

function parseId(rawId: string | string[] | undefined): number {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Identificador de fornecedor inválido.', 400);
  }
  return id;
}

export const supplierController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const search = typeof req.query.search === 'string' ? req.query.search : undefined;
      const suppliers = await supplierService.list(search);
      res.json({ data: suppliers });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const supplier = await supplierService.findById(id);
      res.json({ data: supplier });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = supplierSchema.parse(req.body);
      const supplier = await supplierService.create(parsed);
      res.status(201).json({
        message: 'Fornecedor cadastrado com sucesso!',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      const parsed = supplierSchema.parse(req.body);
      const supplier = await supplierService.update(id, parsed);
      res.json({
        message: 'Fornecedor atualizado com sucesso!',
        data: supplier,
      });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseId(req.params.id);
      await supplierService.remove(id);
      res.json({
        message: 'Fornecedor excluído com sucesso!',
      });
    } catch (error) {
      next(error);
    }
  },
};

