import GoogleProvider from "next-auth/providers/google"
import { NextAuthOptions } from "next-auth"

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.sub as string
    }
    return session
  },
},

}
