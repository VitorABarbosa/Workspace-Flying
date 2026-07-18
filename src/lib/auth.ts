import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { Pool } from 'pg'

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // só admin cria usuários
  },
  plugins: [
    admin({ defaultRole: 'member', adminRoles: ['admin'] }),
    nextCookies(), // DEVE ser o último plugin
  ],
})
