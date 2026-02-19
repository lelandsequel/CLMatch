-- Score suggestions from ShipMachine augmentation layer
-- Agent writes here; human (or auto-QC) promotes to jobs table

CREATE TABLE IF NOT EXISTS score_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_dedupe_key TEXT NOT NULL,
  candidate_id UUID NOT NULL,
  order_id UUID,

  -- Original scores
  keyword_fit_score INTEGER NOT NULL,
  keyword_ghost_score INTEGER NOT NULL,

  -- Augmented scores
  semantic_fit_score INTEGER,
  semantic_reasons JSONB DEFAULT '[]',
  combined_score INTEGER,

  -- Gap analysis
  gap_analysis JSONB,

  -- Ghost deep check
  ghost_deep_check JSONB,

  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'auto_approved')),
  auto_approved_at TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_score_suggestions_candidate ON score_suggestions(candidate_id);
CREATE INDEX idx_score_suggestions_status ON score_suggestions(status);
CREATE INDEX idx_score_suggestions_job ON score_suggestions(job_dedupe_key);

-- Auto-approve trigger: if combined_score >= threshold, auto-approve
CREATE OR REPLACE FUNCTION auto_approve_score_suggestion()
RETURNS TRIGGER AS $$
DECLARE
  threshold NUMERIC := 0.82;
BEGIN
  IF NEW.combined_score IS NOT NULL AND (NEW.combined_score::NUMERIC / 100) >= threshold THEN
    NEW.status := 'auto_approved';
    NEW.auto_approved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_approve_score_suggestion
  BEFORE INSERT ON score_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_score_suggestion();

COMMENT ON TABLE score_suggestions IS
  'ShipMachine agent writes augmented score suggestions here. Human or auto-QC promotes them. Agent cannot modify job scores directly.';
