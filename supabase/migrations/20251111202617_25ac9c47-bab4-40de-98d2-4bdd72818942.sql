-- Fix profiles table email exposure
-- Drop the overly permissive policy that allows anyone to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Add restricted policy: users can only view their own profile
CREATE POLICY "Users view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow admins to view all profiles
CREATE POLICY "Admins view all profiles" 
ON profiles FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Fix clients table: add explicit SELECT policy
CREATE POLICY "Admins can view clients" 
ON clients FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

-- Fix client_products table: add explicit SELECT policy
CREATE POLICY "Admins view products" 
ON client_products FOR SELECT 
USING (has_role(auth.uid(), 'admin'));