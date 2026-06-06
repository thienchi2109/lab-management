import type { SampleBillingStatus, SampleStatus } from "./schemas";

/** Công ty khách hàng dùng trong bộ lọc và biểu mẫu mẫu xét nghiệm. */
export type CompanyOption = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

/** Khách hàng cá nhân dùng trong bộ lọc và biểu mẫu mẫu xét nghiệm. */
export type CustomerOption = {
  id: string;
  companyId: string | null;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  isActive: boolean;
};

/** Loại mẫu xét nghiệm dùng trong bộ lọc và biểu mẫu mẫu. */
export type SampleTypeOption = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

/** Lô KIT có thể liên kết hiển thị với metadata mẫu. */
export type KitBatchOption = {
  id: string;
  kitTypeName: string;
  lotNumber: string;
};

/** Dòng metadata mẫu đã được chuẩn hóa cho bảng dashboard. */
export type SampleMetadataRow = {
  id: string;
  sampleCode: string;
  sampleTypeId: string;
  sampleTypeName: string;
  customerId: string | null;
  customerName: string;
  companyId: string | null;
  companyName: string | null;
  kitBatchId: string | null;
  kitSummary: string;
  collectedAt: string | null;
  receivedAt: string;
  status: SampleStatus;
  billingStatus: SampleBillingStatus;
  note: string | null;
  updatedAt: string;
};

/** View model đầy đủ cho trang quản lý metadata mẫu xét nghiệm. */
export type SampleMetadata = {
  summary: {
    totalSamples: number;
    receivedSamples: number;
    inProgressSamples: number;
    unpaidSamples: number;
  };
  samples: SampleMetadataRow[];
  companies: CompanyOption[];
  customers: CustomerOption[];
  sampleTypes: SampleTypeOption[];
  kitBatches: KitBatchOption[];
  filterOptions: {
    sampleTypes: Array<[string, string]>;
    companies: Array<[string, string]>;
    billingStatuses: Array<[SampleBillingStatus, string]>;
  };
};

type CompanyRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type CustomerRow = {
  id: string;
  company_id: string | null;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
};

type SampleTypeRow = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
};

type KitBatchRow = {
  id: string;
  kit_type_name: string;
  lot_number: string;
};

type SampleRow = {
  id: string;
  sample_type_id: string;
  customer_id: string | null;
  company_id: string | null;
  kit_batch_id: string | null;
  sample_code: string;
  customer_name: string | null;
  collected_at: string | null;
  received_at: string;
  status: SampleStatus;
  billing_status: SampleBillingStatus;
  metadata: Record<string, unknown>;
  updated_at: string;
};

const UNKNOWN_SAMPLE_TYPE_LABEL = "Không rõ loại mẫu";
const MISSING_CUSTOMER_LABEL = "Chưa có khách";
const MISSING_KIT_LABEL = "Chưa gán KIT";

/** Map database sample metadata rows into the dashboard view model. */
export function mapSampleMetadataRows(input: {
  companies: CompanyRow[];
  customers: CustomerRow[];
  sampleTypes: SampleTypeRow[];
  kitBatches: KitBatchRow[];
  samples: SampleRow[];
}): SampleMetadata {
  const companies = input.companies.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.is_active,
  }));
  const customers = input.customers.map((row) => ({
    id: row.id,
    companyId: row.company_id,
    code: row.code,
    name: row.name,
    phone: row.phone,
    email: row.email,
    isActive: row.is_active,
  }));
  const sampleTypes = input.sampleTypes.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    isActive: row.is_active,
  }));
  const kitBatches = input.kitBatches.map((row) => ({
    id: row.id,
    kitTypeName: row.kit_type_name,
    lotNumber: row.lot_number,
  }));

  const companyById = new Map(
    companies.map((company) => [company.id, company])
  );
  const customerById = new Map(
    customers.map((customer) => [customer.id, customer])
  );
  const sampleTypeById = new Map(sampleTypes.map((type) => [type.id, type]));
  const kitBatchById = new Map(kitBatches.map((batch) => [batch.id, batch]));

  const samples = input.samples.map((row) => {
    const customer = row.customer_id ? customerById.get(row.customer_id) : null;
    const company = row.company_id ? companyById.get(row.company_id) : null;
    const sampleType = sampleTypeById.get(row.sample_type_id);
    const kitBatch = row.kit_batch_id
      ? kitBatchById.get(row.kit_batch_id)
      : null;
    const note =
      typeof row.metadata.note === "string" ? row.metadata.note : null;

    return {
      id: row.id,
      sampleCode: row.sample_code,
      sampleTypeId: row.sample_type_id,
      sampleTypeName: sampleType?.name ?? UNKNOWN_SAMPLE_TYPE_LABEL,
      customerId: row.customer_id,
      customerName:
        row.customer_name ?? customer?.name ?? MISSING_CUSTOMER_LABEL,
      companyId: row.company_id,
      companyName: company?.name ?? null,
      kitBatchId: row.kit_batch_id,
      kitSummary: kitBatch
        ? `${kitBatch.kitTypeName} - ${kitBatch.lotNumber}`
        : MISSING_KIT_LABEL,
      collectedAt: row.collected_at,
      receivedAt: row.received_at,
      status: row.status,
      billingStatus: row.billing_status,
      note,
      updatedAt: row.updated_at,
    };
  });

  return {
    summary: summarizeSamples(samples),
    samples,
    companies,
    customers,
    sampleTypes,
    kitBatches,
    filterOptions: {
      sampleTypes: sampleTypes.map((type) => [type.id, type.name]),
      companies: companies.map((company) => [company.id, company.name]),
      billingStatuses: [
        ["unpaid", "Chưa thu"],
        ["invoiced", "Đã xuất hóa đơn"],
        ["paid", "Đã thanh toán"],
        ["eom_credit", "Công nợ cuối tháng"],
      ],
    },
  };
}

function summarizeSamples(samples: SampleMetadataRow[]) {
  const summary = {
    totalSamples: 0,
    receivedSamples: 0,
    inProgressSamples: 0,
    unpaidSamples: 0,
  };

  for (const sample of samples) {
    summary.totalSamples += 1;

    if (sample.status === "received") {
      summary.receivedSamples += 1;
    }

    if (sample.status === "in_progress") {
      summary.inProgressSamples += 1;
    }

    if (sample.billingStatus === "unpaid") {
      summary.unpaidSamples += 1;
    }
  }

  return summary;
}
