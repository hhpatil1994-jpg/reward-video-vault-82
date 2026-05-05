CREATE POLICY "Admins can insert advertisements" ON public.advertisements
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update advertisements" ON public.advertisements
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete advertisements" ON public.advertisements
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));