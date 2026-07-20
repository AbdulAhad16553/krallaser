import Image from "next/image"
import Link from "next/link"
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle, 
  Music, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Shield, 
  Truck, 
  CreditCard, 
  Clock, 
  Star,
  ArrowRight,
  CheckCircle,
  Award,
  Users,
  Heart,
  Zap
} from "lucide-react"
import { getStorePage } from "@/hooks/getStorePage"
import { getSocialLink } from "@/hooks/getSocialLinks"
import type { ReactElement } from "react"
interface FooterProps {
  storeData: {
    store_detail?: {
      footer_logo_id: string
      tagline?: string
      primary_color?: string
      secondary_color?: string
      currency?: string
    }
    store_name: string
    id: string
    company_logo?: string
    store_contact_detail?: {
      email: string
      phone: string
      address: string
      city: string
      country: string
      country_code?: string
    }
  }
}

interface SocialLink {
  id: string
  platform_name: string
  social_link: string
}

const Footer = async ({ storeData }: FooterProps) => {
  const footerLogoId = storeData?.store_detail?.footer_logo_id
  const companyLogo = storeData?.company_logo
  const storeName = storeData?.store_name
  const storeId = storeData?.id
  const tagline = storeData?.store_detail?.tagline
  const primaryColor = storeData?.store_detail?.primary_color || "#0368E5"
  const secondaryColor = storeData?.store_detail?.secondary_color || "#363E47"
  const currency = storeData?.store_detail?.currency || "$"

  const { page } = await getStorePage(storeId, "about-us")
  const { socialLinks } = await getSocialLink(storeId)

  let companyContactDetails = {
    email: "krallaser@gmail.com",
    phone: "0322 4414443",
    address: storeData?.store_contact_detail?.address,
  }

  // Use the short description from the page or a fallback description
  const description =
    page?.content ||
    tagline ||
    `${storeName} — metal fiber laser cutting machines and spare parts in Pakistan.`

  const socialIcons: Record<string, ReactElement> = {
    facebook: <Facebook size={20} />,
    twitter: <Twitter size={20} />,
    instagram: <Instagram size={20} />,
    whatsapp: <MessageCircle size={20} />,
    tiktok: <Music size={20} />,
  }

  // Trust factors and features
  const trustFeatures = [
    { icon: Shield, text: "Secure Shopping", color: "text-green-500" },
    { icon: Truck, text: "Fast Delivery", color: "text-blue-500" },
    { icon: CreditCard, text: "Multiple Payment Options", color: "text-purple-500" },
    { icon: Clock, text: "24/7 Support", color: "text-orange-500" },
  ]

  // Company stats (these could be made dynamic in the future)
  const companyStats = [
    { number: "1000+", label: "Happy Customers", icon: Users },
    { number: "50+", label: "Product Categories", icon: Award },
    { number: "99%", label: "Satisfaction Rate", icon: Heart },
    { number: "24h", label: "Response Time", icon: Zap },
  ]

  return (
    <footer className="gradient-blue-grey-combined text-white">
      <div className="page-container py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            
            <div className="lg:col-span-4">
              <div className="mb-8">
                <div className="mb-6">
                  <Image
                    src="/krallogo.svg"
                    alt={`${storeName || "Store"} Logo`}
                    width={200}
                    height={62}
                    className="max-h-12 w-auto object-contain opacity-100"
                  />
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-6 max-w-sm">
                  {description}
                </p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {trustFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/90">
                      <feature.icon size={16} className={feature.color} />
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
                {socialLinks && socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/90 text-sm">Follow us</span>
                    <div className="flex gap-2">
                      {socialLinks.map((socialLink: any) => {
                        const platformKey = socialLink.platform_name.toLowerCase();
                        return socialLink.social_link ? (
                          <Link
                            key={socialLink.id}
                            href={socialLink.social_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white hover:text-white transition-colors"
                            aria-label={socialLink.platform_name}
                          >
                            {socialIcons[platformKey] || <span className="text-xs">{socialLink.platform_name}</span>}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about-us" className="text-white/90 hover:text-white transition-colors text-sm">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="/machine" className="text-white/90 hover:text-white transition-colors text-sm">Machines</Link>
                </li>
                <li>
                  <Link href="/machine-installation" className="text-white/90 hover:text-white transition-colors text-sm">
                    Machine Installation
                  </Link>
                </li>
                <li>
                  <Link href="/parts" className="text-white/90 hover:text-white transition-colors text-sm">Parts & Accessories</Link>
                </li>
                <li>
                  <Link href="/category" className="text-white/90 hover:text-white transition-colors text-sm">Categories</Link>
                </li>
                <li>
                  <Link href="/careers" className="text-white/90 hover:text-white transition-colors text-sm">Talent Board</Link>
                </li>
                <li>
                  <Link href="/contact" className="text-white/90 hover:text-white transition-colors text-sm">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy-policy" className="text-white/90 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="text-white/90 hover:text-white transition-colors text-sm">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/shipping-policy" className="text-white/90 hover:text-white transition-colors text-sm">Shipping</Link>
                </li>
                <li>
                  <Link href="/return-policy" className="text-white/90 hover:text-white transition-colors text-sm">Returns</Link>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
              
              <div className="space-y-4">
                {companyContactDetails.email && (
                  <a href={`mailto:${companyContactDetails.email}`} className="block text-white/90 hover:text-white transition-colors text-sm">
                    {companyContactDetails.email}
                  </a>
                )}
                {companyContactDetails.phone && (
                  <a href={`tel:${companyContactDetails.phone}`} className="block text-white/90 hover:text-white transition-colors text-sm">
                    {companyContactDetails.phone}
                  </a>
                )}
                {companyContactDetails.address && (
                  <p className="text-white/90 text-sm leading-relaxed max-w-xs">
                    {companyContactDetails.address}
                  </p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {companyStats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-white/15 rounded-lg">
                    <div className="text-white font-semibold">{stat.number}</div>
                    <div className="text-white/90 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-10 mt-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap items-center justify-center gap-6 text-white/90">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Secure
                </span>
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Fast Delivery
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Trusted
                </span>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-white/90">
                <span>&copy; {new Date().getFullYear()} {storeName}</span>
                <Link href="https://github.com/AbdulAhad16553" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Powered by Abdul Ahad
                </Link>
              </div>
            </div>
          </div>
        </div>
    </footer>
  )
}

export default Footer

