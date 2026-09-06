-- Tracks how many meal photos a user uploaded each day.
-- The counter only ever increments — deleting a logged meal does NOT free up
-- an upload slot, so users can't bypass the daily limit by deleting entries.
CREATE TABLE IF NOT EXISTS public.photo_upload_log (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, upload_date)
);

ALTER TABLE public.photo_upload_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own upload log"
  ON public.photo_upload_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own upload log"
  ON public.photo_upload_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own upload log"
  ON public.photo_upload_log FOR UPDATE
  USING (auth.uid() = user_id);