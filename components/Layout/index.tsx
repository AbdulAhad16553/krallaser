import React, { Suspense } from 'react'
import Footer from '../Footer'
import Image from 'next/image'
import { Toaster } from 'sonner'
import Header from '../Header'
import MobileBottomNav from '../MobileBottomNav'

const normalizePhoneNumber = (phone: string): string => {
    phone = phone.trim()
    if (phone.startsWith('+')) return phone
    if (phone.startsWith('0')) return '+92' + phone.slice(1)
    return phone // optional: handle any fallback case
}

interface LayoutProps {
  children: React.ReactNode
  showFooter?: boolean
}

const Layout = ({ children, showFooter = true }: LayoutProps) => {
    const storeBase = {
        id: "default-store",
        store_name: "Krallaser",
        company_id: "Krallaser",
        store_components: [],
    };
    const contact = "";
    const whatsappLink = contact ? `https://wa.me/${normalizePhoneNumber(contact).replace('+', '')}` : null

    const storeDataWithLogo = {
        ...storeBase,
    };

    return (
        <>
            <Header storeData={storeDataWithLogo} />
            <main className="min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
                {children}
            </main>
            <MobileBottomNav />
            {showFooter && (
                <div className="hidden md:block">
                    <Suspense fallback={<div className="h-40 bg-neutral-100" aria-hidden />}>
                        <Footer storeData={storeDataWithLogo} />
                    </Suspense>
                </div>
            )}
            <Toaster />
            {whatsappLink && (
                <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed z-50 w-12 h-12 bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] right-4 md:bottom-6 md:right-6"
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