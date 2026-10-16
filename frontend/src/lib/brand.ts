export const BRAND = {
  name: 'QuickStore',
  tagline: 'Scan it. Pay. Walk out.',
  description:
    'QuickStore turns every product QR code into a self-checkout lane. Shoppers scan, review the bill and pay by UPI; owners get live stock and sales insights.',
};

// Seeded accounts from backend/prisma/seed.ts, offered on the login page for demos.
export const DEMO_ACCOUNTS = {
  customer: { email: 'customer@email.com', password: 'password' },
  owner: { email: 'owner@store.com', password: 'password' },
} as const;
