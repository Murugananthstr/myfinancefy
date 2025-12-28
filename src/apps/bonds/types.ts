import { Timestamp } from 'firebase/firestore';

export interface BondHeader {
  id: string;
  name: string;        // e.g., "US Treasury 2024"
  issuer: string;      // e.g., "Govt", "Corporate"
  isin?: string;       // International Securities Identification Number
  description?: string; 
}

export interface BondFinancials {
  faceValue: number;       // Value at maturity (Principal)
  purchasePrice: number;   // What you paid
  currency: string;        // e.g. 'USD', 'EUR'
  
  purchaseDate: Timestamp; 
  maturityDate: Timestamp;
  
  couponRate: number;      // Annual interest rate in percentage (e.g., 5.0 for 5%)
  frequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
}

export interface BondDocument extends BondHeader, BondFinancials {
  userId: string;          // Owner ID
  status: 'active' | 'matured' | 'sold';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CashFlowEvent {
  date: Date;
  amount: number;
  type: 'coupon' | 'principal';
  status: 'projected' | 'paid';
}
