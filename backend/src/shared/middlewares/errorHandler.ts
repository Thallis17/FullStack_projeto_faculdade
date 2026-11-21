import fs from 'node:fs';
import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

function cleanupRequestFile(req: Request): void {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    fs.unlink(req.file.path, () => {
      // Ignore cleanup error
    });
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  cleanupRequestFile(req);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      ...(err.fieldErrors ? { fieldErrors: err.fieldErrors } : {}),
    });
    return;
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'form';
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }

    res.status(400).json({
      message: 'Existem campos inválidos ou obrigatórios em branco.',
      fieldErrors,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'A imagem deve ter no máximo 5MB.'
        : 'Erro ao fazer upload da imagem.';
    res.status(400).json({
      message,
      fieldErrors: { image: message },
    });
    return;
  }

  console.error('Erro interno não tratado:', err);
  res.status(500).json({
    message: 'Erro interno no servidor. Tente novamente mais tarde.',
  });
}

