import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogTitle } from "@radix-ui/react-dialog"

interface CartAnimationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  productImageSrc: any
}

export function CartAnimationDialog({ isOpen, onOpenChange, productImageSrc }: CartAnimationDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[300px] sm:max-w-md p-0 overflow-hidden bg-transparent border-none shadow-none">
        <DialogTitle className="sr-only">Product added to cart</DialogTitle>
        <div className="relative h-80 w-full">
          <div className="cart-animation-container">
            <div className="product-image">
              <Image
                src={productImageSrc?.image_id
                  ? `${process.env.NEXT_PUBLIC_NHOST_STORAGE_URL}/files/${productImageSrc?.image_id}`
                  : "/placeholder.svg"}
                alt="Product"
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
            </div>
            <div className="cart-icon bg-primary">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
            <div className="success-message">Added to cart!</div>
          </div>
        </div>
      </DialogContent>
      <style jsx>{`
        .cart-animation-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: white;
          backdrop-filter: blur(8px);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .product-image {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
          animation: flyToCart 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
        }
        
        .cart-icon {
          position: absolute;
          right: 20%;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          animation: showCart 0.3s ease forwards 0.8s, pulse 1s ease-in-out 1.1s;
        }
        
        .success-message {
          position: absolute;
          bottom: 30%;
          font-weight: bold;
          color: black;
          font-size: 1.5rem;
          opacity: 0;
          animation: fadeIn 0.5s ease forwards 1.5s;
        }
        
        @keyframes flyToCart {
          0% {
            left: 0;
            transform: translateY(-50%) scale(1) rotate(0deg);
            opacity: 1;
          }
          60% {
            left: 50%;
            transform: translateY(-50%) scale(0.8) rotate(10deg);
            opacity: 1;
          }
          80% {
            left: 70%;
            transform: translateY(-50%) scale(0.6) rotate(5deg);
            opacity: 0.8;
          }
          100% {
            left: 80%;
            transform: translateY(-50%) scale(0.2) rotate(0deg);
            opacity: 0;
          }
        }
        
        @keyframes showCart {
          from { opacity: 0; transform: translateY(-50%) scale(0.8); }
          to { opacity: 1; transform: translateY(-50%) scale(1); }
        }
        
        @keyframes pulse {
          0% { transform: translateY(-50%) scale(1); }
          50% { transform: translateY(-50%) scale(1.2); }
          100% { transform: translateY(-50%) scale(1); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Dialog>
  )
}

