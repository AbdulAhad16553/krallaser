import { NextRequest, NextResponse } from "next/server";


export async function middleware(req: NextRequest) {
    try {
        const host = req.nextUrl.host;
        const storeUrl = host.includes(":") ? process.env.NEXT_PUBLIC_STORE_DOMAIN : host;

        console.log("storeUrl", storeUrl);
        const response = await fetch(`${storeUrl}/api/fetchStore`);
        const data = await response.json();
        console.log("data", data);

        return NextResponse.next();
    } catch (error) {
        console.error("Error fetching store data:", error);
        return NextResponse.next();
    }
}

export const config = {
    matcher: [
        "/",
        "/comingsoon",
        "/cart",
        "/checkout",
        "/profile",
        "/category/:path*",
        "/product/:path*",
    ],
};
