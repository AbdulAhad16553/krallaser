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
import axios from "axios"
import { getErpnextImageUrl } from "@/lib/erpnextImageUtils"

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
  const primaryColor = storeData?.store_detail?.primary_color || "#dc2626"
  const secondaryColor = storeData?.store_detail?.secondary_color || "#1f2937"
  const currency = storeData?.store_detail?.currency || "$"

  const { page } = await getStorePage(storeId, "about-us")
  const { socialLinks } = await getSocialLink(storeId)

  // Fetch company contact details from ERPNext API
  let companyContactDetails = {
    email: storeData?.store_contact_detail?.email,
    phone: storeData?.store_contact_detail?.phone,
    address: storeData?.store_contact_detail?.address,
  }

  try {
    const ERP_BASE_URL = `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource`
    const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY
    const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET

    if (API_KEY && API_SECRET) {
      const companyName = "Kral Laser"
      const encodedName = encodeURIComponent(companyName)
      const response = await axios.get(
        `${ERP_BASE_URL}/Company/${encodedName}?fields=["email","phone_no"]`,
        {
          headers: {
            Authorization: `token ${API_KEY}:${API_SECRET}`,
          },
        }
      )

      if (response.data?.data) {
        companyContactDetails = {
          email: response.data.data.email || companyContactDetails.email || "cnckral@gmail.com",
          phone: response.data.data.phone_no || companyContactDetails.phone || "+923103339404",
          address: "76 C Gulshan e Rehman Sultan Ahmad Road ichra, Lahore, Pakistan",
        }
      }
    }
  } catch (error) {
    console.error("Error fetching company contact details:", error)
    // Use fallback values
    companyContactDetails = {
      email: companyContactDetails.email || "cnckral@gmail.com",
      phone: companyContactDetails.phone || "+923103339404",
      address: "76 C Gulshan e Rehman Sultan Ahmad Road ichra, Lahore, Pakistan",
    }
  }

  // Use the short description from the page or a fallback description
  const description =
    page?.content ||
    tagline ||
    `${storeName} is your trusted partner for high-quality products and exceptional service.`

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
    <footer className="relative overflow-hidden">
      {/* Background with dynamic colors */}
      <div 
        className="relative"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/5 rounded-full translate-x-20 translate-y-20"></div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            
            {/* Brand Section - Spans 4 columns */}
            <div className="lg:col-span-4">
              <div className="mb-8">
                {companyLogo || footerLogoId ? (
                  <div className="mb-6">
                    <Image
                      src={
                        companyLogo
                          ? getErpnextImageUrl(companyLogo)
                          : `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL}/files/${footerLogoId}`
                      }
                      alt={`${storeName || "Store"} Logo`}
                      width={180}
                      height={60}
                      className="max-h-16 object-contain"
                      unoptimized={!!companyLogo}
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white mb-2">{storeName}</h2>
                    <div className="w-16 h-1 bg-white/30 rounded-full"></div>
                  </div>
                )}
                
                <p className="text-white/90 text-lg leading-relaxed mb-6 max-w-md">
                  {description}
                </p>

                {/* Trust Features */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {trustFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                      <feature.icon size={16} className={feature.color} />
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                {socialLinks && socialLinks.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-white/70 text-sm font-medium">Follow us:</span>
                    <div className="flex gap-2">
                      {socialLinks.map((socialLink: any) => {
                        const platformKey = socialLink.platform_name.toLowerCase()
                        return socialLink.social_link ? (
                          <Link
                            key={socialLink.id}
                            href={socialLink.social_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group"
                            aria-label={socialLink.platform_name}
                          >
                            <div className="group-hover:scale-110 transition-transform duration-300">
                              {socialIcons[platformKey] || <span className="text-sm">{socialLink.platform_name}</span>}
                            </div>
                          </Link>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links Section - Spans 2 columns */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/about-us" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    About us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/shop" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Shop
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/category" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Categories
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Links Section - Spans 2 columns */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/privacy-policy" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/terms-conditions" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/shipping-policy" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Shipping Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/return-policy" 
                    className="text-white/80 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-white/50 rounded-full group-hover:bg-white transition-colors"></span>
                    Return Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Section - Spans 4 columns */}
            <div className="lg:col-span-4">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Contact Us
              </h3>
              
              <div className="space-y-4">
                {companyContactDetails.email && (
                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Email</p>
                      <a 
                        href={`mailto:${companyContactDetails.email}`}
                        className="text-white hover:text-white/80 transition-colors duration-200"
                      >
                        {companyContactDetails.email}
                      </a>
                    </div>
                  </div>
                )}

                {companyContactDetails.phone && (
                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Phone</p>
                      <a 
                        href={`tel:${companyContactDetails.phone}`}
                        className="text-white hover:text-white/80 transition-colors duration-200"
                      >
                        {companyContactDetails.phone}
                      </a>
                    </div>
                  </div>
                )}

                {companyContactDetails.address && (
                  <div className="flex items-start gap-3 group">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm font-medium">Address</p>
                      <p className="text-white leading-relaxed">
                        {companyContactDetails.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Company Stats */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                {companyStats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-center mb-2">
                      <stat.icon size={20} className="text-white/80" />
                    </div>
                    <div className="text-white font-bold text-lg">{stat.number}</div>
                    <div className="text-white/70 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-white text-2xl font-bold mb-3">Stay Updated</h3>
              <p className="text-white/80 mb-6">Get the latest updates, exclusive offers, and product announcements delivered to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-900 placeholder-gray-500"
                />
                <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-white/90 transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12 opacity-80">
            <div className="flex items-center gap-2 text-white/70">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium">SSL Secured</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium">100% Safe</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Trusted Store</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Truck className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-900 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-gray-400 text-sm">
              <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>Made with ❤️ for our customers</span>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Powered by <Link href="https://www.items.pk" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white/80 transition-colors duration-200">items.pk</Link></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

