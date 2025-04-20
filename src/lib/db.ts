import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

// Add connection handling for better reliability in production
prisma.$connect()
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Database connection established');
    }
  })
  .catch((e) => {
    console.error('Failed to connect to database:', e);
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;