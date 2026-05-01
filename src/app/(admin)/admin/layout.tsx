// src/app/(admin)/admin/layout.tsx
import { Suspense } from 'react'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = { title: 'Admin — BagBliss BD' }
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session || session.user?.role !== 'admin') {
    redirect('/login')
  }

  return (
    <Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  )
}