import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic' // never cache — must check live session

const SOCKET_JWT_SECRET = process.env.SOCKET_JWT_SECRET

export async function GET() {
  if (!SOCKET_JWT_SECRET) {
    console.error('[socket-token] SOCKET_JWT_SECRET is not set')
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  const session = await auth()

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = jwt.sign(
    {
      sub:   session.user.id,
      role:  session.user.role,
      scope: 'admin-socket',
    },
    SOCKET_JWT_SECRET,
    { expiresIn: '5m' }
  )

  return NextResponse.json({ token })
}