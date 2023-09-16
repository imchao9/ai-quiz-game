import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import { HttpsProxyAgent } from "https-proxy-agent";

declare module 'next-auth' {
    interface Session extends DefaultSession {
        user: {
            id: string,
        } & DefaultSession['user']
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
    }
}

let agent: any = null;

if (process.env.NODE_ENV === "development") {
    agent = new HttpsProxyAgent(process.env.HTTP_PROXY as string);
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            httpOptions: {
                agent: agent,
            },
        }),

    ],
    callbacks: {
        jwt: async ({ token }) => {
            const db_user = await prisma.user.findUnique({
                where: {
                    email: token?.email as string
                }
            });

            if (db_user) {
                token.id = db_user.id;
            }

            return token;
        },
        session: async ({ session, token }) => {
            session.user.id = token.id;
            session.user.email = token.email;
            session.user.name = token.name;
            session.user.image = token.picture as string;
            return session;
        }
    }
}

export const getAuthSession = () => {
    return getServerSession(authOptions);
};