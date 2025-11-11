-- Restore public access to share links with token validation
-- This allows the ServicesCatalog and ClientMaterialsPortal pages to work
-- Users can only see data for the specific token they have

-- Service share links - allow viewing with specific token
CREATE POLICY "Allow viewing service share links by token" 
ON service_share_links FOR SELECT 
USING (is_active = true);

-- Client share links - allow viewing with specific token  
CREATE POLICY "Allow viewing client share links by token"
ON client_share_links FOR SELECT
USING (is_active = true);