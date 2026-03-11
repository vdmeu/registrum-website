/**
 * Codeweavers Limited (04092394) financial data — hardcoded for the financials example page.
 *
 * Source: Registrum API response for /v1/company/04092394/financials
 * Reporting period: Year ended 31 December 2024 (FY2024)
 * Accounts type: full iXBRL (FRS-102/2024-01-01)
 *
 * Figures are in actual GBP integers (e.g. 4571000 = £4,571,000).
 * Fetched live from Companies House via the Registrum API on 2026-03-11.
 */

export interface FinancialValue {
  current: number | null;
  prior: number | null;
}

export interface CompanyFinancials {
  company_name: string;
  company_number: string;
  accounts_type: string;
  period_end: string;
  period_start: string;
  currency: string;
  data_quality: {
    completeness: number;
    fields_attempted: number;
    fields_extracted: number;
    has_profit_loss: boolean;
    has_balance_sheet: boolean;
    taxonomy_version: string | null;
    missing_fields: string[];
  };
  profit_and_loss: {
    turnover: FinancialValue | null;
    gross_profit: FinancialValue | null;
    operating_profit: FinancialValue | null;
    profit_before_tax: FinancialValue | null;
    tax: FinancialValue | null;
    profit_after_tax: FinancialValue | null;
    depreciation: FinancialValue | null;
  };
  balance_sheet: {
    fixed_assets: FinancialValue | null;
    intangible_assets: FinancialValue | null;
    current_assets: FinancialValue | null;
    stocks: FinancialValue | null;
    debtors: FinancialValue | null;
    cash: FinancialValue | null;
    creditors_within_one_year: FinancialValue | null;
    creditors_after_one_year: FinancialValue | null;
    net_assets: FinancialValue | null;
    equity: FinancialValue | null;
    share_capital: FinancialValue | null;
    retained_earnings: FinancialValue | null;
  };
  other: {
    employees: FinancialValue | null;
  };
}

export const exampleFinancials: CompanyFinancials = {
  company_name: "CODEWEAVERS LIMITED",
  company_number: "04092394",
  accounts_type: "full",
  period_end: "2024-12-31",
  period_start: "2024-01-01",
  currency: "GBP",
  data_quality: {
    completeness: 0.5,
    fields_attempted: 20,
    fields_extracted: 10,
    has_profit_loss: true,
    has_balance_sheet: true,
    taxonomy_version: "FRS-102/2024-01-01",
    missing_fields: [
      "turnover",
      "gross_profit",
      "operating_profit",
      "profit_before_tax",
      "tax",
      "depreciation",
      "stocks",
      "creditors_after_one_year",
      "share_capital",
      "retained_earnings",
    ],
  },
  profit_and_loss: {
    turnover: null,
    gross_profit: null,
    operating_profit: null,
    profit_before_tax: null,
    tax: null,
    profit_after_tax: { current: 4_571_000, prior: 2_355_000 },
    depreciation: null,
  },
  balance_sheet: {
    fixed_assets: { current: 3_928_000, prior: 2_546_000 },
    intangible_assets: { current: 2_695_000, prior: 1_076_000 },
    current_assets: { current: 6_803_000, prior: 5_161_000 },
    stocks: null,
    debtors: { current: 6_493_000, prior: 2_676_000 },
    cash: { current: 310_000, prior: 2_485_000 },
    creditors_within_one_year: { current: 1_386_000, prior: 2_714_000 },
    creditors_after_one_year: null,
    net_assets: { current: 9_206_000, prior: 4_635_000 },
    equity: { current: 0, prior: 0 },
    share_capital: null,
    retained_earnings: null,
  },
  other: {
    employees: { current: 142, prior: 128 },
  },
};

/** Format a number as a short GBP string (e.g. £68.2B, £1.4M, £295K) */
export function fmtGbp(n: number | null): string {
  if (n === null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}£${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}£${(abs / 1_000).toFixed(0)}K`;
  return `${sign}£${abs}`;
}

/** Format employees count */
export function fmtEmployees(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("en-GB");
}
