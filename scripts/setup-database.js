#!/usr/bin/env node
// Database setup script for Supabase

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('EcoSnap Database Setup for Production');
console.log('=====================================');
console.log('This script will help you set up your Supabase database for production.');
console.log('Make sure you have created a Supabase project and have your credentials ready.');

rl.question('\nEnter your Supabase URL (e.g., https://yourproject.supabase.co): ', (supabaseUrl) => {
  if (!supabaseUrl) {
    console.error('Supabase URL is required');
    rl.close();
    return;
  }
  
  rl.question('\nEnter your Supabase anon key: ', (supabaseKey) => {
    if (!supabaseKey) {
      console.error('Supabase anon key is required');
      rl.close();
      return;
    }
    
    console.log('\nValidating connection...');
    
    try {
      // Read the SQL script
      const sqlPath = path.join(__dirname, 'supabase-schema.sql');
      console.log(`\nSQL script path: ${sqlPath}`);
      
      console.log('\nPlease execute the SQL script in the Supabase SQL Editor:');
      console.log('\n1. Go to your Supabase project dashboard');
      console.log('2. Navigate to "SQL Editor" in the left sidebar');
      console.log('3. Create a "New Query"');
      console.log('4. Copy and paste the following SQL code:');
      console.log('\n------------------------------------------');
      console.log(fs.readFileSync(sqlPath, 'utf8'));
      console.log('------------------------------------------');
      
      // Update .env file
      const envPath = path.join(__dirname, '..', '.env');
      let envContent = '';
      
      try {
        envContent = fs.readFileSync(envPath, 'utf8');
      } catch (error) {
        // File might not exist
        envContent = '';
      }
      
      // Update or add Supabase environment variables
      const envVars = {
        'NEXT_PUBLIC_SUPABASE_URL': supabaseUrl,
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': supabaseKey
      };
      
      Object.keys(envVars).forEach(key => {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        if (envContent.match(regex)) {
          envContent = envContent.replace(regex, `${key}=${envVars[key]}`);
        } else {
          envContent += `\n${key}=${envVars[key]}`;
        }
      });
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('\n✅ Environment variables have been updated in your .env file');
      console.log('\nImportant: Add these environment variables to your AWS Amplify environment:');
      console.log(`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}`);
      console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}`);
      console.log('NEXTAUTH_SECRET=<generate a strong random string>');
      console.log('NEXTAUTH_URL=<your Amplify app URL>');
    } catch (error) {
      console.error('\n❌ Error setting up the database:', error.message);
    }
    
    rl.close();
  });
});