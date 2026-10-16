import { CustomerShell } from '../../components/nav/CustomerShell';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>;
}
