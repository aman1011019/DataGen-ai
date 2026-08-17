-- DataGen AI SaaS Database Schema for Supabase / PostgreSQL
-- Project Ref: vvisrdickbpcxggbknqj

-- 1. UserProfile Table
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" VARCHAR(255) PRIMARY KEY,
    "supabaseUid" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "displayName" VARCHAR(255),
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Standard users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" VARCHAR(255) PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "displayName" VARCHAR(255),
    "photoUrl" TEXT,
    "organization" VARCHAR(255),
    "role" VARCHAR(100),
    "plan" VARCHAR(50) DEFAULT 'Normal',
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Dataset Table
CREATE TABLE IF NOT EXISTS "Dataset" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userProfileId" VARCHAR(255) NOT NULL REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100),
    "mlTask" VARCHAR(100),
    "recordCount" INTEGER DEFAULT 0,
    "fieldCount" INTEGER DEFAULT 0,
    "qualityScore" DOUBLE PRECISION DEFAULT 95.0,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. DatasetField Table
CREATE TABLE IF NOT EXISTS "DatasetField" (
    "id" VARCHAR(255) PRIMARY KEY,
    "datasetId" VARCHAR(255) NOT NULL REFERENCES "Dataset"("id") ON DELETE CASCADE,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "required" BOOLEAN DEFAULT true,
    "nullable" BOOLEAN DEFAULT false,
    "syntheticStrategy" VARCHAR(100) DEFAULT 'realistic_distribution'
);

-- 5. User Datasets Storage Sync Table
CREATE TABLE IF NOT EXISTS "user_datasets" (
    "id" VARCHAR(255) PRIMARY KEY,
    "dataset_id" VARCHAR(255) NOT NULL,
    "owner_user_id" VARCHAR(255) NOT NULL,
    "payload" JSONB,
    "synced_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. User Notifications Table
CREATE TABLE IF NOT EXISTS "user_notifications" (
    "id" VARCHAR(255) PRIMARY KEY,
    "notification_id" VARCHAR(255) NOT NULL,
    "user_id" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255),
    "message" TEXT,
    "type" VARCHAR(50),
    "read" BOOLEAN DEFAULT false,
    "timestamp" TIMESTAMP WITH TIME ZONE,
    "synced_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. UsageWindow Table
CREATE TABLE IF NOT EXISTS "UsageWindow" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userProfileId" VARCHAR(255) NOT NULL REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "datasetsCreatedCount" INTEGER DEFAULT 0,
    "lastGeneratedAt" TIMESTAMP WITH TIME ZONE,
    "windowResetAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GenerationJob Table
CREATE TABLE IF NOT EXISTS "GenerationJob" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userProfileId" VARCHAR(255) NOT NULL REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "datasetId" VARCHAR(255),
    "taskType" VARCHAR(100),
    "domain" VARCHAR(100),
    "requestedRows" INTEGER DEFAULT 0,
    "generatedRows" INTEGER DEFAULT 0,
    "validRows" INTEGER DEFAULT 0,
    "status" VARCHAR(50) DEFAULT 'completed',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS "idx_dataset_user" ON "Dataset"("userProfileId");
CREATE INDEX IF NOT EXISTS "idx_datasetfield_dataset" ON "DatasetField"("datasetId");
CREATE INDEX IF NOT EXISTS "idx_usagewindow_user" ON "UsageWindow"("userProfileId");
CREATE INDEX IF NOT EXISTS "idx_generationjob_user" ON "GenerationJob"("userProfileId");
CREATE INDEX IF NOT EXISTS "idx_user_datasets_owner" ON "user_datasets"("owner_user_id");
CREATE INDEX IF NOT EXISTS "idx_user_notifications_user" ON "user_notifications"("user_id");
