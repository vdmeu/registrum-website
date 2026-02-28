import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: { json: vi.fn() },
}));

import { MOCK_SEARCH, MOCK_COMPANY, MOCK_DIRECTORS, API_BASE } from "./route";

describe("MOCK_SEARCH shape", () => {
  it("items have company_name (not title)", () => {
    for (const item of MOCK_SEARCH.data.items) {
      expect(item).toHaveProperty("company_name");
      expect(item).not.toHaveProperty("title");
    }
  });

  it("items have registered_office_address object (not address_snippet string)", () => {
    for (const item of MOCK_SEARCH.data.items) {
      expect(item).toHaveProperty("registered_office_address");
      expect(typeof item.registered_office_address).toBe("object");
      expect(item).not.toHaveProperty("address_snippet");
    }
  });

  it("registered_office_address has address_line_1, locality, postal_code", () => {
    for (const item of MOCK_SEARCH.data.items) {
      const addr = item.registered_office_address;
      expect(addr).toHaveProperty("address_line_1");
      expect(addr).toHaveProperty("locality");
      expect(addr).toHaveProperty("postal_code");
    }
  });
});

describe("HTTPS / mixed-content", () => {
  it("API_BASE uses https (not http) to prevent mixed-content browser warnings", () => {
    expect(API_BASE).toMatch(/^https:\/\//);
  });
});

describe("MOCK_DIRECTORS shape", () => {
  it("has current_directors array", () => {
    expect(Array.isArray(MOCK_DIRECTORS.data.current_directors)).toBe(true);
    expect(MOCK_DIRECTORS.data.current_directors.length).toBeGreaterThan(0);
  });

  it("each director has name, role, appointed_on, other_appointments", () => {
    for (const d of MOCK_DIRECTORS.data.current_directors) {
      expect(d).toHaveProperty("name");
      expect(d).toHaveProperty("role");
      expect(d).toHaveProperty("appointed_on");
      expect(Array.isArray(d.other_appointments)).toBe(true);
    }
  });

  it("other_appointments items have company_number and company_name", () => {
    for (const d of MOCK_DIRECTORS.data.current_directors) {
      for (const appt of d.other_appointments) {
        expect(appt).toHaveProperty("company_number");
        expect(appt).toHaveProperty("company_name");
      }
    }
  });
});

describe("MOCK_COMPANY shape", () => {
  it("has nested accounts.overdue (not flat accounts_overdue)", () => {
    expect(MOCK_COMPANY.data).toHaveProperty("accounts");
    expect(MOCK_COMPANY.data.accounts).toHaveProperty("overdue");
    expect(MOCK_COMPANY.data).not.toHaveProperty("accounts_overdue");
  });

  it("has nested confirmation_statement.overdue (not flat confirmation_statement_overdue)", () => {
    expect(MOCK_COMPANY.data).toHaveProperty("confirmation_statement");
    expect(MOCK_COMPANY.data.confirmation_statement).toHaveProperty("overdue");
    expect(MOCK_COMPANY.data).not.toHaveProperty("confirmation_statement_overdue");
  });

  it("has sic_codes array", () => {
    expect(Array.isArray(MOCK_COMPANY.data.sic_codes)).toBe(true);
    expect(MOCK_COMPANY.data.sic_codes.length).toBeGreaterThan(0);
  });
});
