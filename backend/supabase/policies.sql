create policy "Individuals can select their profile" on profiles
  for select using (auth.uid() = id);

create policy "Individuals can insert their profile" on profiles
  for insert with check (auth.uid() = id);

create policy "Individuals can update their profile" on profiles
  for update using (auth.uid() = id);

create policy "Individuals can select their tasks" on tasks
  for select using (auth.uid() is not null);

create policy "Individuals can select their manuscripts" on manuscripts
  for select using (auth.uid() = profile_id);

create policy "Individuals can insert their manuscripts" on manuscripts
  for insert with check (auth.uid() = profile_id);

create policy "Individuals can update their manuscripts" on manuscripts
  for update using (auth.uid() = profile_id);

create policy "Individuals can select their chat entries" on chat_entries
  for select using (auth.uid() = profile_id);

create policy "Individuals can insert their chat entries" on chat_entries
  for insert with check (auth.uid() = profile_id);

create policy "Individuals can delete their chat entries" on chat_entries
  for delete using (auth.uid() = profile_id);
