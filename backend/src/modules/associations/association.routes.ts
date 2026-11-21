import { Router } from 'express';
import { associationController } from './association.controller';

export const associationRoutes = Router();

associationRoutes.get('/dashboard', associationController.dashboard);
associationRoutes.get('/products/:productId/suppliers', associationController.listByProduct);
associationRoutes.post('/products/:productId/suppliers', associationController.associate);
associationRoutes.delete(
  '/products/:productId/suppliers/:supplierId',
  associationController.disassociate
);

