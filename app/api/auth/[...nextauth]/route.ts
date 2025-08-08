import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import dbConnect from "@/lib/db";

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/", // Redirect to home page instead of default signin page
  },
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signIn({ user }: any) {
      await dbConnect();
      const dbUser = await User.findOne({ email: user.email });
      if (!dbUser) {
        await User.create({
          name: user.name,
          email: user.email,
          studentType: "Hostelite",
          budget: { monthly: 0, categories: {} },
          goals: [],
        });
      }
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      // On initial sign in, add MongoDB _id to token
      if (user) {
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) token._id = dbUser._id.toString();
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      // Always ensure session.user exists and has _id
      if (!session.user) session.user = {};
      if (token && token._id) session.user._id = token._id;
      console.log("Session callback:", session);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
