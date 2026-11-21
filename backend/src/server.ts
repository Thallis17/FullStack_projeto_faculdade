import 'dotenv/config';
import { app } from './app';
import { prisma } from './shared/database/prisma';

const PORT = Number(process.env.PORT) || 3333;

const server = app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

