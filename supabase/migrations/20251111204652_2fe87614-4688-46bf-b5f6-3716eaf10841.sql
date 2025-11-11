-- Remove public SELECT policies that allow token enumeration
DROP POLICY IF EXISTS "Anyone can view active share links by token" ON service_share_links;
DROP POLICY IF EXISTS "Anyone can view active client share links by token" ON client_share_links;

-- Note: Access to share links is now validated through edge functions
-- validate-service-share-link and validate-client-share-link
-- These functions use the service role key to validate tokens securely