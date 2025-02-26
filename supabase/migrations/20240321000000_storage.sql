
-- Create storage bucket for design uploads
insert into storage.buckets (id, name, public)
values ('designs', 'designs', true);

-- Set up storage policy to allow uploads
create policy "Anyone can upload design images"
on storage.objects for insert
with check (
  bucket_id = 'designs'
);

-- Set up storage policy to allow public reading of design images
create policy "Anyone can view design images"
on storage.objects for select
using (
  bucket_id = 'designs'
);
