import { Router } from 'express';
import { productImageUpload } from '../../shared/middlewares/upload';
import { productController } from './product.controller';

export const productRoutes = Router();

productRoutes.get('/', productController.list);
productRoutes.get('/:id', productController.findById);
productRoutes.post('/', productImageUpload.single('image'), productController.create);
productRoutes.put('/:id', productImageUpload.single('image'), productController.update);
productRoutes.delete('/:id', productController.remove);

