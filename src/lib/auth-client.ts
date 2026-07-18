import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

// Sem baseURL: o client usa same-origin (window.location.origin), que é o
// desejado — a app e os endpoints /api/auth vivem na mesma origem.
export const authClient = createAuthClient({
  plugins: [adminClient()],
})
