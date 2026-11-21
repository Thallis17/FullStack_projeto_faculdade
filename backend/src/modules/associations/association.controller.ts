import { NextFunction, Request, Response } from 'express';
import { AppError } from '../../shared/errors/AppError';
import { associateSupplierSchema } from './association.schema';
import { associationService } from './association.service';

function parsePositiveId(raw: string | undefined, label: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(`Identificador de ${label} inválido.`, 400);
  }
  return id;
}

export const associationController = {
  async listByProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parsePositiveId(req.params.productId, 'produto');
      const data = await associationService.listByProduct(productId);
      res.json({ data });
    } catch (error) {
      next(error);
    }
  },

  async associate(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parsePositiveId(req.params.productId, 'produto');
      const { supplierId } = associateSupplierSchema.parse(req.body);
      const association = await associationService.associate(productId, supplierId);

      res.status(201).json({
        message: 'Fornecedor associado com sucesso ao produto!',
        data: association,
      });
    } catch (error) {
      next(error);
    }
  },

  async disassociate(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = parsePositiveId(req.params.productId, 'produto');
      const supplierId = parsePositiveId(req.params.supplierId, 'fornecedor');
      await associationService.disassociate(productId, supplierId);

      res.json({
        message: 'Fornecedor desassociado com sucesso!',
      });
    } catch (error) {
      next(error);
    }
  },

  async dashboard(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await associationService.getDashboardSummary();
      res.json({ data });
    } catch (error) {
      next(error);
    }
  },
};

