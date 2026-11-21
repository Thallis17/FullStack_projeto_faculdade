import cors from 'cors';
import express from 'express';
import { associationRoutes } from './modules/associations/association.routes';
import { productRoutes } from './modules/products/product.routes';
import { supplierRoutes } from './modules/suppliers/supplier.routes';
import { errorHandler } from './shared/middlewares/errorHandler';
import { UPLOADS_DIR } from './shared/middlewares/upload';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(UPLOADS_DIR));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api', associationRoutes);

app.use(errorHandler);

