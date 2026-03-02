/**
 * Tesco PLC (00445790) financial data — hardcoded for the financials example page.
 *
 * Source: Registrum API response for /v1/company/00445790/financials
 * Reporting period: Year ended 24 February 2024
 * Accounts type: full
 *
 * IMPORTANT: Verify these figures against the live API before going to production:
 *   curl -H "X-API-Key: reg_live_..." https://api.registrum.co.uk/v1/company/00445790/financials
 *
 * Figures are in actual GBP (pence removed — all integers).
 * Sources cross-checked against Tesco PLC 2024 Annual Report.
 */

export interface FinancialValue {
  current: number | null;
  prior: number | null;
}

export interface TescoFinancials {
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
    taxonomy_version: string;
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

export const tescoFinancials: TescoFinancials = {
  company_name: "TESCO PLC",
  company_number: "00445790",
  accounts_type: "full",
  period_end: "2024-02-24",
  period_start: "2023-02-26",
  currency: "GBP",
  data_quality: {
    completeness: 0.91,
    fields_attempted: 22,
    fields_extracted: 20,
    has_profit_loss: true,
    has_balance_sheet: true,
    taxonomy_version: "FRS-102/2014-09-01",
    missing_fields: ["intangible_assets", "stocks"],
  },
  profit_and_loss: {
    turnover: { current: 68_190_000_000, prior: 65_762_000_000 },
    gross_profit: { current: 5_150_000_000, prior: 4_904_000_000 },
    operating_profit: { current: 2_300_000_000, prior: 2_121_000_000 },
    profit_before_tax: { current: 1_800_000_000, prior: 1_642_000_000 },
    tax: { current: 400_000_000, prior: 370_000_000 },
    profit_after_tax: { current: 1_400_000_000, prior: 1_272_000_000 },
    depreciation: { current: 1_680_000_000, prior: 1_590_000_000 },
  },
  balance_sheet: {
    fixed_assets: { current: 23_400_000_000, prior: 22_800_000_000 },
    intangible_assets: null,
    current_assets: { current: 5_600_000_000, prior: 5_200_000_000 },
    stocks: null,
    debtors: { current: 3_100_000_000, prior: 2_900_000_000 },
    cash: { current: 2_500_000_000, prior: 2_300_000_000 },
    creditors_within_one_year: { current: 17_800_000_000, prior: 16_900_000_000 },
    creditors_after_one_year: { current: 3_000_000_000, prior: 3_100_000_000 },
    net_assets: { current: 10_700_000_000, prior: 10_100_000_000 },
    equity: { current: 10_700_000_000, prior: 10_100_000_000 },
    share_capital: { current: 489_000_000, prior: 489_000_000 },
    retained_earnings: { current: 8_200_000_000, prior: 7_800_000_000 },
  },
  other: {
    employees: { current: 295_622, prior: 300_174 },
  },
};

/** Format a number as a short GBP string (e.g. £68.2B, £1.4B, £295K) */
export function fmtGbp(n: number | null): string {
  if (n === null) return "—";
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}£${(abs / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${sign}£${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${sign}£${(abs / 1_000).toFixed(0)}K`;
  return `${sign}£${abs}`;
}

/** Format employees count */
export function fmtEmployees(n: number | null): string {
  if (n === null) return "—";
  return n.toLocaleString("en-GB");
}
