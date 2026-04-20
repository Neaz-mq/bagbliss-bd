import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = { title: 'Admin — BagBliss BD' }

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Double-check — middleware is primary guard, this is a safety net
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    redirect('/login')
  }

  return <AdminShell>{children}</AdminShell>
}