-- Non-destructive idempotent migration for models and paper_models
-- Applied across all database shards (SHARD_1, SHARD_2, SHARD_3, SHARD_4)

-- 1. Models Columns
ALTER TABLE models ADD COLUMN IF NOT EXISTS vendor TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS vendor_logo_url TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS parameter_count TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS modality TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS access_type TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS openness_type TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS release_date TIMESTAMP;
ALTER TABLE models ADD COLUMN IF NOT EXISTS model_family TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS capabilities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE models ADD COLUMN IF NOT EXISTS research_areas JSONB DEFAULT '[]'::jsonb;
ALTER TABLE models ADD COLUMN IF NOT EXISTS architecture JSONB DEFAULT '{}'::jsonb;
ALTER TABLE models ADD COLUMN IF NOT EXISTS context_window INTEGER;
ALTER TABLE models ADD COLUMN IF NOT EXISTS max_output_tokens INTEGER;
ALTER TABLE models ADD COLUMN IF NOT EXISTS input_cost_per_mtoken DOUBLE PRECISION;
ALTER TABLE models ADD COLUMN IF NOT EXISTS output_cost_per_mtoken DOUBLE PRECISION;
ALTER TABLE models ADD COLUMN IF NOT EXISTS license TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS paper_url TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS repository_url TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS api_url TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS hugging_face_id TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS trending_score DOUBLE PRECISION DEFAULT 0;
ALTER TABLE models ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE models ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. Indices for models
CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_models_vendor ON models(vendor);
CREATE INDEX IF NOT EXISTS idx_models_model_family ON models(model_family);
CREATE INDEX IF NOT EXISTS idx_models_category ON models(category);
CREATE INDEX IF NOT EXISTS idx_models_trending_score ON models(trending_score DESC);

-- 3. Columns for paper_models
ALTER TABLE paper_models ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'introduced';
ALTER TABLE paper_models ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION DEFAULT 1.0;
ALTER TABLE paper_models ADD COLUMN IF NOT EXISTS match_source TEXT DEFAULT 'direct';

-- 4. Indices for paper_models
CREATE INDEX IF NOT EXISTS idx_paper_models_model_id ON paper_models(model_id);
CREATE INDEX IF NOT EXISTS idx_paper_models_paper_id ON paper_models(paper_id);
