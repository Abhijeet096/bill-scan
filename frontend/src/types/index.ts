// Shapes returned by the Express API, limited to the fields the UI reads.

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stockQty: number;
  reorderPoint: number;
  gstPercent: number;
  discountPercent: number;
  description?: string | null;
  imageUrl?: string | null;
  expiryDate?: string | null;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';

export interface Order {
  id: string;
  storeId: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  txRef?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface Store {
  id: string;
  name: string;
  address: string;
  logoUrl?: string | null;
  paymentUpiId: string;
  merchantName: string;
  razorpayKeyId?: string | null;
  razorpayKeySecret?: string | null;
  subscriptionPlan: 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE';
  subscriptionExpiresAt: string;
}

export interface Employee {
  id: string;
  role: string;
  permissions: string[];
  user?: { name: string; email: string };
}

export interface EmployeePerformance {
  employeeId: string;
  name: string;
  role: string;
  transactionsCount: number;
  totalSalesGenerated: number;
}

export interface Loyalty {
  points: number;
  tier: string;
  referralCode: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  expiresAt: string;
}
