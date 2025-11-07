import React from 'react'
import Footer from '../Footer'
import { headers } from 'next/headers'
import { getUrlWithScheme } from '@/lib/getUrlWithScheme'
import Image from 'next/image'
import { Toaster } from 'sonner'
import HeaderWrapper from './HeaderWrapper'

const normalizePhoneNumber = (phone: string): string => {
    phone = phone.trim()
    if (phone.startsWith('+')) return phone
    if (phone.startsWith('0')) return '+92' + phone.slice(1)
    return phone // optional: handle any fallback case
}

const Layout = async ({ children }: { children: React.ReactNode }) => {

    const Headers = await headers()
    const host = Headers.get("host");
    if (!host) {
        throw new Error("Host header is missing or invalid");
    }

    const fullStoreUrl = getUrlWithScheme(host);
    const response = await fetch(`${fullStoreUrl}/api/fetchStore`);
    const data = await response.json();
    const contact = data?.store?.stores?.[0]?.store_contact_detail?.phone;
    const whatsappLink = contact ? `https://wa.me/${normalizePhoneNumber(contact).replace('+', '')}` : null

    return (
        <>
            <HeaderWrapper
                storeData={data?.store?.stores?.[0]}
            />
            <main className='min-h-screen'>{children}</main>
            <Footer
                storeData={data?.store?.stores?.[0]}
            />
            <Toaster />
            {whatsappLink && (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 z-50 w-12 h-12"
                >
                    <Image
                        src="/whatsapp-icon.svg" // place the file in your `public/` folder
                        alt="Chat on WhatsApp"
                        width={50}
                        height={50}
                    />
                </a>
            )}
        </>
    )
}

export default Layout