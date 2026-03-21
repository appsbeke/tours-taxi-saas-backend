import { DataSource } from 'typeorm';
import { seedDatabase } from '../database/seed';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  try {
    console.log('🔌 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

runSeed();
