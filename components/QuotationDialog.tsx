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

interface QuotationDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product;
}

export default function QuotationDialog({
  open,
  onClose,
  product,
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
              item_code: product.name,
              qty: form.qty,
              rate: product.price || 0,
              uom: product.stock_uom || "Nos",
              description: product.item_name,
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request Quotation</DialogTitle>
          <DialogDescription>
            Request a quote for {product.item_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Product Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{product.item_name}</p>
                <p className="text-xs text-gray-600">SKU: {product.name}</p>
              </div>
              {product.price && (
                <div className="text-right">
                  <p className="font-bold text-green-600">
                    {product.currency} {product.price.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alert */}
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

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Your Name *</Label>
              <Input
                id="customer_name"
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                value={form.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                name="qty"
                type="number"
                min="1"
                value={form.qty}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="remarks">Additional Remarks</Label>
              <Textarea
                id="remarks"
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

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
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
              "Submit Quotation"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
