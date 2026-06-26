-- FB-20260623-02E follow-up: cover report preset actor foreign keys.

create index report_filter_presets_created_by_idx
  on public.report_filter_presets (created_by);

create index report_filter_presets_updated_by_idx
  on public.report_filter_presets (updated_by);
