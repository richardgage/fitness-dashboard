import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from '@/lib/db'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user) return null
        const passwordMatch = await bcrypt.compare(credentials.password, user.password)
        if (!passwordMatch) return null
        return { id: String(user.id), email: user.email }
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  pages: { signIn: '/login' }
}