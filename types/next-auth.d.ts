import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      _id?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
  }
}
