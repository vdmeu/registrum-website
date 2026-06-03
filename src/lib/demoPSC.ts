// Illustrative PSC data shown to anonymous users on company pages.
// Not from a real company — used to preview what beneficial ownership data looks like.

export interface DemoPscEntry {
  name: string;
  kind: string;
  natures_of_control_plain: string[];
}

export const DEMO_PSC: DemoPscEntry[] = [
  {
    name: "VANGUARD ASSET MANAGEMENT, LIMITED",
    kind: "corporate-entity-person-with-significant-control",
    natures_of_control_plain: [
      "Ownership of shares - More than 25% but not more than 50%",
      "Voting rights - More than 25% but not more than 50%",
    ],
  },
  {
    name: "BLACKROCK INVESTMENT MANAGEMENT (UK) LIMITED",
    kind: "corporate-entity-person-with-significant-control",
    natures_of_control_plain: [
      "Ownership of shares - More than 10% but not more than 25%",
    ],
  },
];
