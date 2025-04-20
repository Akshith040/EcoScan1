#!/usr/bin/env node
// Database setup script for Supabase

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('EcoSnap Database Setup for Production');
console.log('=====================================');
console.log('This script will help you set up your Supabase database for production.');
console.log('Make sure you have created a Supabase project and have your credentials ready.');

rl.question('\nEnter your Supabase PostgreSQL connection string: ', (connectionString) => {
  if (!connectionString) {
    console.error('Connection string is required');
    rl.close();
    return;
  }

  // Set the environment variable for Prisma
  process.env.DATABASE_URL = connectionString;
  
  console.log('\nValidating connection...');
  
  try {
    // Generate Prisma client
    console.log('\nGenerating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Push schema to database
    console.log('\nPushing schema to Supabase...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    
    console.log('\n✅ Database setup complete!');
    console.log('\nImportant: Add this environment variable to your AWS Amplify environment:');
    console.log(`DATABASE_URL=${connectionString}`);
    console.log('\nAnd also add these environment variables:');
    console.log('NEXTAUTH_SECRET=<generate a strong random string>');
    console.log('NEXTAUTH_URL=<your Amplify app URL>');
  } catch (error) {
    console.error('\n❌ Error setting up the database:', error.message);
    console.log('\nPlease check your connection string and try again.');
  }
  
  rl.close();
});