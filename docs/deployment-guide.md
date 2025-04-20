# Production Deployment Guide for EcoSnap Recycle Guide

This guide walks you through setting up your EcoSnap application for production deployment on AWS Amplify with Supabase as the database.

## Prerequisites

- AWS Account with Amplify access
- Supabase account
- Git repository with your code

## Step 1: Set Up Supabase Database

1. Sign up or log in to [Supabase](https://supabase.com/)
2. Create a new project
3. When your project is ready, go to Project Settings → Database
4. Find your database connection string (format: `postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-URL]:5432/postgres`)
5. Run the database setup script:

```bash
npm run setup-db
```

This script will:
- Push your Prisma schema to Supabase
- Generate the Prisma client
- Set up your database tables

## Step 2: Set Up AWS Amplify

1. Sign in to AWS Management Console
2. Navigate to AWS Amplify
3. Click "New app" → "Host web app"
4. Connect to your Git repository (GitHub, GitLab, BitBucket, etc.)
5. Configure build settings (should be automatically detected from amplify.yml)
6. Add environment variables in the "Environment variables" section:
   - `DATABASE_URL` = your Supabase PostgreSQL connection string
   - `NEXTAUTH_SECRET` = a strong random string (generate at https://generate-secret.vercel.app/32)
   - `NEXTAUTH_URL` = the URL of your deployed app (e.g., https://main.xxxxxxxxxxxx.amplifyapp.com)

## Step 3: Deploy Your Application

1. Commit and push your code to your Git repository
2. AWS Amplify will automatically detect changes and start building your app
3. Once the build is complete, your app will be deployed at the provided URL

## Troubleshooting

If you encounter authentication issues:

1. Check your environment variables in AWS Amplify console
2. Verify your Supabase connection is working by checking logs in Amplify
3. Make sure your NEXTAUTH_URL matches exactly the URL of your deployed app
4. If needed, manually redeploy from the AWS Amplify console

## Updating Your Application

When making changes to your app:

1. If you change the database schema, update it using:
   ```bash
   npx prisma db push
   ```

2. For other changes, simply commit and push to your Git repository, and AWS Amplify will automatically redeploy

## Important Notes

- Local SQLite database is replaced with Supabase PostgreSQL in production
- Always test your changes locally before pushing to production
- Remember to keep your environment variables secure