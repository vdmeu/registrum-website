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

const mockDirectorsResponse = {
  status: "success",
  data: {
    current_directors: [
      {
        name: "Ken Murphy",
        role: "Chief Executive",
        appointed_on: "2020-09-01",
        other_appointments: [
          { company_number: "02065605", company_name: "TESCO STORES LTD", role: "Director" },
        ],
      },
    ],
    past_directors: [],
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

  it("Director Network tab is visible in detail panel", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSearchResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockCompanyResponse) } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    const companyName = await screen.findByText("TESCO PLC");
    fireEvent.click(companyName.closest("button")!);
    await screen.findByText("← Back");

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Director Network")).toBeInTheDocument();
  });

  it("Director Network tab fetches directors and renders SVG graph", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSearchResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockCompanyResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockDirectorsResponse) } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    const companyName = await screen.findByText("TESCO PLC");
    fireEvent.click(companyName.closest("button")!);
    await screen.findByText("← Back");

    fireEvent.click(screen.getByText("Director Network"));

    const graph = await screen.findByRole("img", { name: /Director network for TESCO PLC/i });
    expect(graph).toBeInTheDocument();
  });

  it("graph aria-label contains the focal company name", async () => {
    vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockSearchResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockCompanyResponse) } as Response)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockDirectorsResponse) } as Response);

    render(<Demo />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Tesco" } });

    const companyName = await screen.findByText("TESCO PLC");
    fireEvent.click(companyName.closest("button")!);
    await screen.findByText("← Back");

    fireEvent.click(screen.getByText("Director Network"));

    const graph = await screen.findByRole("img");
    expect(graph.getAttribute("aria-label")).toContain("TESCO PLC");
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
