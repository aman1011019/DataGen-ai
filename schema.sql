-- DataGen AI SaaS Database Schema for PostgreSQL / Google Cloud SQL / Firebase Data Connect
-- Instance: datagen-da10d-instance | Service: datagen-da10d-service

-- 1. UserProfile Table
CREATE TABLE IF NOT EXISTS "UserProfile" (
    "id" VARCHAR(255) PRIMARY KEY,
    "firebaseUid" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "displayName" VARCHAR(255),
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Dataset Table
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

-- 3. DatasetField Table
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

-- 4. UsageWindow Table
CREATE TABLE IF NOT EXISTS "UsageWindow" (
    "id" VARCHAR(255) PRIMARY KEY,
    "userProfileId" VARCHAR(255) NOT NULL REFERENCES "UserProfile"("id") ON DELETE CASCADE,
    "datasetsCreatedCount" INTEGER DEFAULT 0,
    "lastGeneratedAt" TIMESTAMP WITH TIME ZONE,
    "windowResetAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. GenerationJob Table
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
