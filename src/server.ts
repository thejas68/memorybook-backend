import app from './app';
import { prisma } from './config/db';
import 'dotenv/config';

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();