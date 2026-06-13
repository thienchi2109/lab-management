# UI Contract

## Mobile-First

| Breakpoint | Layout |
| --- | --- |
| < 1024px | Mobile/tablet: card/accordion, simplified views |
| ≥ 1024px | Desktop: full table layout, column mode |

Principles:

- No expanding dozens of result columns on mobile
- Card/accordion for result groups
- Progress indicators per group
- Primary CTA always accessible

## Dashboard Navigation

Dashboard navigation is viewport-specific:

- Mobile/tablet viewports use a bottom navbar.
- Desktop viewports use the header navbar.
- The dashboard shell does not render a sidebar in any viewport.

Navigation changes must preserve this split before adding new shell primitives.

## Form Zones (Sample Entry)

1. Thông tin mẫu (sample metadata)
2. Thông tin khách hàng/công ty
3. Thông tin KIT
4. Kết quả xét nghiệm theo nhóm (accordion/card per group)
5. Ảnh/file minh chứng
6. Thanh toán/trạng thái

### Result Group Card

Each card shows:

- Group name
- Filled / total metrics count
- Kết Quả Chung status
- Count of positive/abnormal metrics (if any)

Fields rendered by `input_type`. Validation from `validation_json` +
`metric_settings`.

## Data Grid Modes

| Mode | Description |
| --- | --- |
| Compact | Metadata + status + Kết Quả Chung per group |
| Group detail | Expand one sample to see metrics by group |
| Column | Desktop: choose groups/metrics to expand as columns |

## Dashboard

- Samples over time
- Samples by customer/company
- Samples by sample type/kit type
- PCR clean/infected ratio
- Positive rate by PCR metric
- Bacteria group distribution by value range
- Export pivot dataset

Pivot API does not accept raw SQL.
