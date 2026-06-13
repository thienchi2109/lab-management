# Result Engine

The result engine renders dynamic forms for entering lab test results.
Configuration is database-driven, not hard-coded.

## Architecture

```text
result_groups → result_metrics → result_templates → result_template_metrics
                                                          ↓
                                              sample_results + sample_group_conclusions
```

## Result Groups (8 groups in MVP)

1. PCR
2. Vi Khuẩn — TCBS
3. Vi Khuẩn — ChromAgar
4. Chất lượng nước
5. Chất lượng gan tôm
6. Chất lượng ruột tôm
7. Chất lượng tảo
8. Đánh giá bên ngoài — phụ bộ

## Input Types

| input_type | Meaning | Storage |
| --- | --- | --- |
| number | Numeric value | value_num |
| text | Short text | value_text |
| textarea | Long text | value_text |
| select | Single choice | value_text |
| multi_select | Multiple choices | value_json |
| boolean | Yes/No | value_bool |
| scale_1_5 | Rating 1–5 | value_num |
| percent | Percentage | value_num |
| pcr_qualitative | Positive/Negative | value_text |
| pcr_realtime | Positive/Negative + CT nullable | value_json |

## Kết Quả Chung Rules

Each sample can have multiple `sample_group_conclusions`, one per result group.

### PCR Group

- All negative → `SẠCH`
- Any positive → `NHIỄM`
- CT does not change conclusion if status is negative

### Other Groups

- Kết Quả Chung is a text conclusion entered by the user or reviewer
- Suggestion rules may be added later via `metric_settings`

## Metric Settings

Stored in `metric_settings` table, not hard-coded:

- Default unit
- Min/max valid range
- Thresholds: normal / warning / danger
- Conclusion suggestion rules
- Effective date range

Thresholds are frequently updated by Admin — never hard-code.
