-- Non-destructive migration for canonical models, variant collapsing, and high-performance indexing
-- Applied across all database shards (SHARD_1, SHARD_2, SHARD_3, SHARD_4)

-- 1. Add canonical model and variant columns
ALTER TABLE models ADD COLUMN IF NOT EXISTS is_canonical BOOLEAN DEFAULT true;
ALTER TABLE models ADD COLUMN IF NOT EXISTS canonical_model_id TEXT;
ALTER TABLE models ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;
ALTER TABLE models ADD COLUMN IF NOT EXISTS source_catalog TEXT DEFAULT 'openrouter';

-- 2. Performance Indices
CREATE INDEX IF NOT EXISTS idx_models_is_canonical ON models(is_canonical);
CREATE INDEX IF NOT EXISTS idx_models_canonical_model_id ON models(canonical_model_id);
CREATE INDEX IF NOT EXISTS idx_models_release_date ON models(release_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_models_capabilities_gin ON models USING gin(capabilities);
CREATE INDEX IF NOT EXISTS idx_models_research_areas_gin ON models USING gin(research_areas);
CREATE INDEX IF NOT EXISTS idx_models_architecture_gin ON models USING gin(architecture);

-- 3. Trigram extension for ultra-fast full-text name/slug matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_models_name_trgm ON models USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_models_slug_trgm ON models USING gin(slug gin_trgm_ops);
