
CREATE TABLE public.carousel_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.carousel_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view carousel images"
ON public.carousel_images FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Admins can manage carousel images"
ON public.carousel_images FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
