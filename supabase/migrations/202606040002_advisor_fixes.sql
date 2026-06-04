-- US-002 advisor fixes: foreign-key indexes and non-overlapping RLS policies.

create index if not exists audit_events_actor_id_idx on public.audit_events (actor_id);
create index if not exists kit_batches_kit_type_id_idx on public.kit_batches (kit_type_id);
create index if not exists result_metrics_result_group_id_idx on public.result_metrics (result_group_id);
create index if not exists result_template_metrics_organization_id_idx on public.result_template_metrics (organization_id);
create index if not exists result_template_metrics_result_metric_id_idx on public.result_template_metrics (result_metric_id);
create index if not exists result_templates_sample_type_id_idx on public.result_templates (sample_type_id);
create index if not exists sample_group_conclusions_organization_id_idx on public.sample_group_conclusions (organization_id);
create index if not exists sample_group_conclusions_result_group_id_idx on public.sample_group_conclusions (result_group_id);
create index if not exists sample_images_created_by_idx on public.sample_images (created_by);
create index if not exists sample_images_organization_id_idx on public.sample_images (organization_id);
create index if not exists sample_results_entered_by_idx on public.sample_results (entered_by);
create index if not exists sample_results_organization_id_idx on public.sample_results (organization_id);
create index if not exists sample_results_result_metric_id_idx on public.sample_results (result_metric_id);
create index if not exists samples_created_by_idx on public.samples (created_by);
create index if not exists samples_kit_batch_id_idx on public.samples (kit_batch_id);
create index if not exists samples_sample_type_id_idx on public.samples (sample_type_id);

drop policy if exists "admins can manage tenant memberships" on public.tenant_memberships;
drop policy if exists "admins can manage sample types" on public.sample_types;
drop policy if exists "admins can manage kit types" on public.kit_types;
drop policy if exists "editors can manage kit batches" on public.kit_batches;
drop policy if exists "editors can manage samples" on public.samples;
drop policy if exists "editors can manage sample images" on public.sample_images;
drop policy if exists "admins can manage result groups" on public.result_groups;
drop policy if exists "admins can manage result metrics" on public.result_metrics;
drop policy if exists "admins can manage result templates" on public.result_templates;
drop policy if exists "admins can manage result template metrics" on public.result_template_metrics;
drop policy if exists "editors can manage sample results" on public.sample_results;
drop policy if exists "editors can manage sample group conclusions" on public.sample_group_conclusions;

create policy "admins can insert tenant memberships" on public.tenant_memberships for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update tenant memberships" on public.tenant_memberships for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete tenant memberships" on public.tenant_memberships for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "admins can insert sample types" on public.sample_types for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update sample types" on public.sample_types for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete sample types" on public.sample_types for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "admins can insert kit types" on public.kit_types for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update kit types" on public.kit_types for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete kit types" on public.kit_types for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "editors can insert kit batches" on public.kit_batches for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can update kit batches" on public.kit_batches for update to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can delete kit batches" on public.kit_batches for delete to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can insert samples" on public.samples for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can update samples" on public.samples for update to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can delete samples" on public.samples for delete to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can insert sample images" on public.sample_images for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can update sample images" on public.sample_images for update to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can delete sample images" on public.sample_images for delete to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "admins can insert result groups" on public.result_groups for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update result groups" on public.result_groups for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete result groups" on public.result_groups for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "admins can insert result metrics" on public.result_metrics for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update result metrics" on public.result_metrics for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete result metrics" on public.result_metrics for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "admins can insert result templates" on public.result_templates for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update result templates" on public.result_templates for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete result templates" on public.result_templates for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "admins can insert result template metrics" on public.result_template_metrics for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can update result template metrics" on public.result_template_metrics for update to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin']::public.app_role[]));
create policy "admins can delete result template metrics" on public.result_template_metrics for delete to authenticated
  using (private.has_org_role(organization_id, array['admin']::public.app_role[]));

create policy "editors can insert sample results" on public.sample_results for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can update sample results" on public.sample_results for update to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can delete sample results" on public.sample_results for delete to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));

create policy "editors can insert sample group conclusions" on public.sample_group_conclusions for insert to authenticated
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can update sample group conclusions" on public.sample_group_conclusions for update to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]))
  with check (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
create policy "editors can delete sample group conclusions" on public.sample_group_conclusions for delete to authenticated
  using (private.has_org_role(organization_id, array['admin','editor']::public.app_role[]));
