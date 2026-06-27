-- FB-20260623-02F: force report image writes through audited service-role RPCs.

drop policy if exists "admins can insert report images" on public.report_images;
drop policy if exists "admins can delete report images" on public.report_images;
