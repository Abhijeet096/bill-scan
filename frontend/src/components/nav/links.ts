import {
  Award, BarChart3, Boxes, CreditCard, History, Home, LayoutDashboard, Package, ScanLine, Settings, ShoppingCart, Users,
  type LucideIcon,
} from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const CUSTOMER_LINKS: NavLink[] = [
  { href: '/customer/home', label: 'Home', icon: Home },
  { href: '/customer/scanner', label: 'Scan', icon: ScanLine },
  { href: '/customer/cart', label: 'Cart', icon: ShoppingCart },
  { href: '/customer/loyalty', label: 'Rewards', icon: Award },
  { href: '/customer/history', label: 'History', icon: History },
];

export const OWNER_LINKS: NavLink[] = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/products', label: 'Products', icon: Package },
  { href: '/owner/inventory', label: 'Inventory', icon: Boxes },
  { href: '/owner/reports', label: 'Reports', icon: BarChart3 },
  { href: '/owner/employees', label: 'Staff', icon: Users },
  { href: '/owner/subscription', label: 'Plan & billing', icon: CreditCard },
  { href: '/owner/settings', label: 'Settings', icon: Settings },
];
