import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, afterEach } from "vitest";
import Demo from "./Demo";

const mockSearchResponse = {
  status: "success",
  data: {
    items: [
      {
        company_number: "00445790",
        company_name: "TESCO PLC",
        company_status: "active",
        date_of_creation: "1947-11-27",
        registered_office_address: {
          address_line_1: "Tesco House, Shire Park",
          locality: "Welwyn Garden City",
          postal_code: "AL7 1GA",
        },
      },
    ],
  },
  _mock: true,
};

const mockCompanyResponse = {
  status: "success",
  data: {
    company_number: "00445790",
    company_name: "TESCO PLC",
    company_status: "active",
    company_type: "plc",
    date_of_creation: "1947-11-27",
    company_age_years: 78,
    registered_office_address: {
      address_line_1: "Tesco House, Shire Park",
      locality: "Welwyn Garden City",
      postal_code: "AL7 1GA",
    },
    accounts: { overdue: false },
    confirmation_statement: { overdue: false },
    sic_codes: ["47110"],
  },
  _mock: true,
};

// findByText polls every 50ms for up to 1000ms — well within the 400ms debounce window.
// No fake timers needed; the real debounce fires before findByText gives up.

describe("Demo", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders input with placeholder text", () => {
    render(<Demo />);
    expect(
      screen.getByPlaceholderText(/Search any UK company/i)
    ).toBeInTheDocument();
  });

  it("shows company names after typing and debounce", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve(mockSearchResponse),
    } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    expect(await screen.findByText("TESCO PLC")).toBeInTheDocument();
  });

  it("shows detail panel with status badge and SIC codes after selecting a company", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSearchResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockCompanyResponse) } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    const companyName = await screen.findByText("TESCO PLC");
    fireEvent.click(companyName.closest("button")!);

    // "← Back" only appears once the detail panel has loaded
    await screen.findByText("← Back");
    expect(screen.getByText("SIC codes")).toBeInTheDocument();
    expect(screen.getByText("47110")).toBeInTheDocument();
  });

  it("all external links in the detail panel use https (no mixed-content risk)", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSearchResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockCompanyResponse) } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    const companyName = await screen.findByText("TESCO PLC");
    fireEvent.click(companyName.closest("button")!);
    await screen.findByText("← Back");

    const links = document.querySelectorAll("a[href]");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      const href = link.getAttribute("href")!;
      if (href.startsWith("http")) {
        expect(href, `Link "${href}" must use https`).toMatch(/^https:\/\//);
      }
    });
  });

  it("back button returns to search results list", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSearchResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockCompanyResponse) } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    const companyName = await screen.findByText("TESCO PLC");
    fireEvent.click(companyName.closest("button")!);

    const backButton = await screen.findByText("← Back");
    fireEvent.click(backButton);

    expect(screen.queryByText("← Back")).not.toBeInTheDocument();
    expect(screen.getByText("TESCO PLC")).toBeInTheDocument();
  });
});
