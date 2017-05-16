export interface Price {
  readonly amount?: number;
  readonly currency?: string;
}

export interface Pricing {
  readonly price?: Price;
  readonly frequency?: PricingFrequency;
}

export type PricingFrequency = 'oneTime';