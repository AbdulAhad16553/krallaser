// "use client";

// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

// interface Product {
//   name: string;
//   item_name: string;
//   price?: number;
//   currency?: string;
//   stock_uom?: string;
// }

// interface QuotationDialogProps {
//   open: boolean;
//   onClose: () => void;
//   product: Product;
// }

// export default function QuotationDialog({
//   open,
//   onClose,
//   product,
// }: QuotationDialogProps) {
//   const [form, setForm] = useState({
//     customer_name: "",
//     email: "",
//     mobile: "",
//     qty: 1,
//     remarks: "",
//   });
//   const [loading, setLoading] = useState(false);
//   const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: name === 'qty' ? parseInt(value) || 1 : value });
//   };

//   const handleSubmit = async () => {
//     if (!form.customer_name || !form.email) {
//       setAlert({ type: "error", message: "Please fill in all required fields" });
//       return;
//     }

//     setLoading(true);
//     setAlert(null);
    
//     try {
//       const res = await fetch("/api/quotation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           customer_name: form.customer_name,
//           email: form.email,
//           mobile: form.mobile,
//           remarks: form.remarks,
//           items: [
//             {
//               item_code: product.name,
//               qty: form.qty,
//               rate: product.price || 0,
//               uom: product.stock_uom || "Nos",
//               description: product.item_name,
//             },
//           ],
//         }),
//       });

//       const data = await res.json();
//       if (data.success) {
//         setAlert({ type: "success", message: data.message || "Quotation submitted successfully! We'll contact you soon." });
//         setForm({ customer_name: "", email: "", mobile: "", qty: 1, remarks: "" });
//         setTimeout(() => {
//           onClose();
//           setAlert(null);
//         }, 2000);
//       } else {
//         setAlert({ type: "error", message: data.message || "Failed to submit quotation" });
//       }
//     } catch (err: any) {
//       setAlert({ type: "error", message: err.message || "Something went wrong" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     if (!loading) {
//       setForm({ customer_name: "", email: "", mobile: "", qty: 1, remarks: "" });
//       setAlert(null);
//       onClose();
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-[425px]">
//         <DialogHeader>
//           <DialogTitle>Request Quotation</DialogTitle>
//           <DialogDescription>
//             Request a quote for {product.item_name}
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="grid gap-4 py-4">
//           {/* Product Info */}
//           <div className="bg-gray-50 p-3 rounded-lg">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="font-medium text-sm">{product.item_name}</p>
//                 <p className="text-xs text-gray-600">SKU: {product.name}</p>
//               </div>
//               {product.price && (
//                 <div className="text-right">
//                   <p className="font-bold text-green-600">
//                     {product.currency} {product.price.toLocaleString()}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Alert */}
//           {alert && (
//             <Alert variant={alert.type === "error" ? "destructive" : "default"}>
//               {alert.type === "success" ? (
//                 <CheckCircle className="h-4 w-4" />
//               ) : (
//                 <AlertCircle className="h-4 w-4" />
//               )}
//               <AlertDescription>{alert.message}</AlertDescription>
//             </Alert>
//           )}

//           {/* Form Fields */}
//           <div className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="customer_name">Your Name *</Label>
//               <Input
//                 id="customer_name"
//                 name="customer_name"
//                 value={form.customer_name}
//                 onChange={handleChange}
//                 placeholder="Enter your full name"
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="email">Email Address *</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 placeholder="Enter your email address"
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="mobile">Mobile Number</Label>
//               <Input
//                 id="mobile"
//                 name="mobile"
//                 type="tel"
//                 value={form.mobile}
//                 onChange={handleChange}
//                 placeholder="Enter your mobile number"
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="qty">Quantity</Label>
//               <Input
//                 id="qty"
//                 name="qty"
//                 type="number"
//                 min="1"
//                 value={form.qty}
//                 onChange={handleChange}
//                 disabled={loading}
//               />
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="remarks">Additional Remarks</Label>
//               <Textarea
//                 id="remarks"
//                 name="remarks"
//                 value={form.remarks}
//                 onChange={handleChange}
//                 placeholder="Any specific requirements or questions..."
//                 rows={3}
//                 disabled={loading}
//               />
//             </div>
//           </div>
//         </div>

//         <DialogFooter>
//           <Button
//             type="button"
//             variant="outline"
//             onClick={handleClose}
//             disabled={loading}
//           >
//             Cancel
//           </Button>
//           <Button
//             type="button"
//             onClick={handleSubmit}
//             disabled={loading}
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Submitting...
//               </>
//             ) : (
//               "Submit Quotation"
//             )}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Product {
  name: string;
  item_name: string;
  price?: number;
  currency?: string;
  stock_uom?: string;
}

interface Variation {
  name: string;
  item_name: string;
  price?: number;
  currency?: string;
  stock_uom?: string;
  attributes?: Array<{
    attribute: string;
    attribute_value: string;
  }>;
}

interface QuotationDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
  selectedVariation?: Variation; // Add this prop
}

export default function QuotationDialog({
  open,
  onClose,
  product,
  selectedVariation, // Add this prop
}: QuotationDialogProps) {
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    mobile: "",
    qty: 1,
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Use selectedVariation if available, otherwise use product
  const displayProduct = selectedVariation || product;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'qty' ? parseInt(value) || 1 : value });
  };

  const handleSubmit = async () => {
    if (!form.customer_name || !form.email) {
      setAlert({ type: "error", message: "Please fill in all required fields" });
      return;
    }

    setLoading(true);
    setAlert(null);
    
    try {
      const res = await fetch("/api/quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.customer_name,
          email: form.email,
          mobile: form.mobile,
          remarks: form.remarks,
          items: [
            {
              item_code: displayProduct.name, // Use displayProduct name
              qty: form.qty,
              rate: displayProduct.price || 0, // Use displayProduct price
              uom: displayProduct.stock_uom || "Nos",
              description: displayProduct.item_name, // Use displayProduct item_name
              // Include attributes if it's a variation
              ...(selectedVariation?.attributes && { 
                attributes: selectedVariation.attributes 
              })
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAlert({ type: "success", message: data.message || "Quotation submitted successfully! We'll contact you soon." });
        setForm({ customer_name: "", email: "", mobile: "", qty: 1, remarks: "" });
        setTimeout(() => {
          onClose();
          setAlert(null);
        }, 2000);
      } else {
        setAlert({ type: "error", message: data.message || "Failed to submit quotation" });
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setForm({ customer_name: "", email: "", mobile: "", qty: 1, remarks: "" });
      setAlert(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
     <DialogContent className="max-w-[900px] p-6">
  <DialogHeader>
    <DialogTitle>Request Quotation</DialogTitle>
    <DialogDescription>
      Request a quote for {displayProduct.item_name}
    </DialogDescription>
  </DialogHeader>

  {/* NEW FLEX LAYOUT */}
  <div className="flex gap-6 mt-4 max-h-[70vh] overflow-y-auto">
    {/* LEFT SIDE – PRODUCT DETAILS */}
    <div className="w-[200px] shrink-0 bg-gray-50 p-4 rounded-lg border h-fit">
      <div className="space-y-3">
        <div>
          <p className="font-semibold text-base text-gray-900">{displayProduct.item_name}</p>
          <p className="text-sm text-gray-600 mt-1">
            SKU: {displayProduct.name}
          </p>
        </div>

        {selectedVariation?.attributes && selectedVariation.attributes.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs font-medium text-gray-500 mb-2">Specifications:</p>
            <div className="flex flex-wrap gap-2">
              {selectedVariation.attributes.map((attr, idx) => (
                <span 
                  key={idx} 
                  className="text-xs bg-white px-2 py-1 rounded border"
                >
                  {attr.attribute}: <span className="font-medium">{attr.attribute_value}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {displayProduct.price && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="font-bold text-green-600">
              {displayProduct.currency || "PKR"}{" "}
              {displayProduct.price.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>

    {/* RIGHT SIDE – FORM */}
    <div className="flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        {alert && (
          <Alert variant={alert.type === "error" ? "destructive" : "default"}>
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Your Name *</Label>
            <Input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address *</Label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Mobile Number</Label>
            <Input
              name="mobile"
              type="tel"
              value={form.mobile}
              onChange={handleChange}
              placeholder="Enter your mobile number"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              name="qty"
              type="number"
              min="1"
              value={form.qty}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Remarks</Label>
            <Textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Any specific requirements or questions..."
              rows={3}
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* BUTTONS */}
      <DialogFooter className="pt-4">
        <Button variant="outline" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Request Quote"
          )}
        </Button>
      </DialogFooter>
    </div>
  </div>
</DialogContent>
    </Dialog>
  );
}