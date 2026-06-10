create index if not exists samples_org_received_at_idx
  on public.samples (organization_id, received_at desc);
