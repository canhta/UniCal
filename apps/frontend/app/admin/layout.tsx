import { Metadata } from 'next';
import { AdminLayout } from '../../components/admin/layout/AdminLayout';

export const metadata: Metadata = {
  title: 'UniCal Admin Panel',
  description: 'Administration panel for UniCal',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth check is handled by middleware, no need to duplicate here
  
  return <AdminLayout>{children}</AdminLayout>;
}
