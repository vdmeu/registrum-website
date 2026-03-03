// Hardcoded Tesco PLC director network data.
// Source: GET /v1/company/00445790/directors — fetched 2026-03-02.
// Update manually if personnel change significantly.

export interface DirectorAppointment {
  company_number: string;
  company_name: string;
  role: string;
}

export interface DirectorRecord {
  name: string;
  role: string;
  nationality?: string;
  other_appointments: DirectorAppointment[];
}

export const TESCO_DIRECTORS: DirectorRecord[] = [
  {
    name: "TAYLOR, Christopher Jon",
    role: "secretary",
    other_appointments: [],
  },
  {
    name: "BETHELL, Melissa",
    role: "director",
    nationality: "British",
    other_appointments: [
      { company_number: "01844327", company_name: "ST MARY'S SCHOOL ASCOT", role: "director" },
      { company_number: "08038055", company_name: "OCEAN BIDCO LIMITED", role: "director" },
      { company_number: "FC040033", company_name: "ATOLL HOLDCO LTD.", role: "director" },
      { company_number: "FC040032", company_name: "ATOLL BIDCO LTD", role: "director" },
      { company_number: "14073891", company_name: "ATOLL MIDCO LTD", role: "director" },
      { company_number: "14074113", company_name: "ATOLL DEBTCO LTD", role: "director" },
      { company_number: "02907116", company_name: "SADLER'S WELLS LIMITED", role: "director" },
      { company_number: "01488786", company_name: "SADLER'S WELLS TRUST LIMITED", role: "director" },
      { company_number: "00023307", company_name: "DIAGEO PLC", role: "director" },
    ],
  },
  {
    name: "BODSON, Bertrand Jean Francois",
    role: "director",
    other_appointments: [
      { company_number: "15452897", company_name: "HOUTING UK LIMITED", role: "director" },
      { company_number: "15452346", company_name: "HOUTING MIDCO LIMITED", role: "director" },
      { company_number: "15450782", company_name: "HOUTING TOPCO UK LIMITED", role: "director" },
      { company_number: "08548351", company_name: "KEYWORDS STUDIOS LIMITED", role: "director" },
    ],
  },
  {
    name: "FAIRBAIRN, Carolyn Julie",
    role: "director",
    nationality: "British",
    other_appointments: [],
  },
  {
    name: "GARNIER, Thierry Dominique Gerard",
    role: "director",
    other_appointments: [
      { company_number: "01664812", company_name: "KINGFISHER PLC", role: "director" },
    ],
  },
  {
    name: "GILLILAND, Stewart Charles",
    role: "director",
    nationality: "British",
    other_appointments: [
      { company_number: "01401155", company_name: "IG DESIGN GROUP PLC", role: "director" },
      { company_number: "02896421", company_name: "NATURES WAY FOODS LIMITED", role: "director" },
      { company_number: "06908850", company_name: "SMDH CONSULTING LIMITED", role: "director" },
      { company_number: "05346831", company_name: "INFUZIONS LIMITED", role: "director" },
    ],
  },
  {
    name: "KENNEDY, Christopher John",
    role: "director",
    nationality: "British",
    other_appointments: [
      { company_number: "04967001", company_name: "ITV PLC", role: "director" },
      { company_number: "03106525", company_name: "ITV STUDIOS LIMITED", role: "director" },
      { company_number: "00955957", company_name: "ITV BROADCASTING LIMITED", role: "director" },
      { company_number: "11801341", company_name: "BRITBOX SVOD LIMITED", role: "director" },
      { company_number: "11423826", company_name: "THE ADDRESSABLE PLATFORM LIMITED", role: "director" },
      { company_number: "00229607", company_name: "ITV SERVICES LIMITED", role: "director" },
    ],
  },
  {
    name: "MURPHY, Gerard Martin",
    role: "director",
    nationality: "Irish",
    other_appointments: [],
  },
  {
    name: "MURPHY, Ken",
    role: "director",
    nationality: "Irish",
    other_appointments: [
      { company_number: "00519500", company_name: "TESCO STORES LIMITED", role: "director" },
      { company_number: "00243011", company_name: "TESCO HOLDINGS LIMITED", role: "director" },
    ],
  },
  {
    name: "NAWAZ, Imran",
    role: "director",
    nationality: "British",
    other_appointments: [
      { company_number: "00519500", company_name: "TESCO STORES LIMITED", role: "director" },
      { company_number: "00243011", company_name: "TESCO HOLDINGS LIMITED", role: "director" },
      { company_number: "03193632", company_name: "TESCO OVERSEAS INVESTMENTS LIMITED", role: "director" },
      { company_number: "08629715", company_name: "TESCO CORPORATE TREASURY SERVICES PLC", role: "director" },
    ],
  },
  {
    name: "SILVER, Caroline Louise",
    role: "director",
    nationality: "British",
    other_appointments: [
      { company_number: "00604574", company_name: "BARRATT REDROW PLC", role: "director" },
      { company_number: "00981908", company_name: "NATIONAL FILM AND TELEVISION SCHOOL (THE)", role: "director" },
      { company_number: "06219884", company_name: "ICE CLEAR EUROPE LIMITED", role: "director" },
      { company_number: "07788681", company_name: "THE V&A FOUNDATION", role: "director" },
      { company_number: "OC357986", company_name: "MOELIS CAPITAL MARKETS LLP", role: "llp-designated-member" },
    ],
  },
  {
    name: "WHITWORTH, Karen Tracy",
    role: "director",
    nationality: "British",
    other_appointments: [
      { company_number: "00576970", company_name: "NUFFIELD HEALTH", role: "director" },
      { company_number: "08215888", company_name: "TRITAX BIG BOX REIT PLC", role: "director" },
    ],
  },
];

export const TESCO_NETWORK_STATS = {
  companyNumber: "00445790",
  companyName: "TESCO PLC",
  totalDirectors: 12,
  executiveDirectors: 2,   // Murphy Ken, Nawaz Imran
  nonExecDirectors: 9,
  secretaries: 1,
  connectedCompanies: 26,  // Unique companies via shared directors (depth=1)
  fetchedAt: "2026-03-02",
};
