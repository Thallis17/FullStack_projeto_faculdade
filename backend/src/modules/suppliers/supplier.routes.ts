import { Router } from 'express';
import { supplierController } from './supplier.controller';

export const supplierRoutes = Router();

supplierRoutes.get('/', supplierController.list);
supplierRoutes.get('/:id', supplierController.findById);
supplierRoutes.post('/', supplierController.create);
supplierRoutes.put('/:id', supplierController.update);
supplierRoutes.delete('/:id', supplierController.remove);

