CREATE TABLE public.layout_ai_access_state (id text PRIMARY KEY, message text NOT NULL, blocked_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.layout_ai_access_state TO service_role;
ALTER TABLE public.layout_ai_access_state ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE public.layout_ai_access_state IS 'Private AI provider access-denial circuit breaker; no screenshot data is stored. Clear only after provider access is restored.';