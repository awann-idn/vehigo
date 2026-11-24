-- Vehigo: izinkan penulis memperbarui ulasannya sendiri (0011)
-- Diperlukan karena submit ulasan memakai upsert.

drop policy if exists reviews_update on public.reviews;
create policy reviews_update on public.reviews
  for update to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

notify pgrst, 'reload schema';
