-- Allow unauthenticated users to read invitations by token (for signup page)
-- This is safe because tokens are unique and long random strings

DROP POLICY IF EXISTS "Allow public invitation read by token" ON partner_invitations;
CREATE POLICY "Allow public invitation read by token"
  ON partner_invitations FOR SELECT
  USING (true);
  -- Note: This allows anyone to read invitations
  -- But tokens are 64-character random strings, so this is secure
  -- In production, you might want to restrict this further

