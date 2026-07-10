'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/currencyUtils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Lock, ShoppingBag, Tag, X } from 'lucide-react';
import Link from 'next/link';
import {
  currencyCode,
  trackInitiateCheckout,
  trackPurchase,
} from '@/lib/metaPixel';

const APPLIED_COUPON_KEY = 'appliedCoupon';

interface AppliedCoupon {
  code: string;
  couponName: string;
  couponTitle?: string;
  discountAmount: number;
  discountPercentage?: number;
  discountType?: 'percentage' | 'amount';
}

interface OrderSummaryProps {
  storeCurrency: string;
  necessary?: {
    storeId?: string;
    companyId?: string;
  };
}

const OrderSummary = ({ storeCurrency, necessary }: OrderSummaryProps) => {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  useEffect(() => {
    const handleCartUpdate = () => {
      try {
        const cartDataString = sessionStorage.getItem('cart');
        const cartData = cartDataString ? JSON.parse(cartDataString) : [];
        setCartItems(Array.isArray(cartData) ? cartData : []);
      } catch {
        setCartItems([]);
      }
    };

    try {
      const stored = sessionStorage.getItem(APPLIED_COUPON_KEY);
      if (stored) setAppliedCoupon(JSON.parse(stored));
    } catch {
      setAppliedCoupon(null);
    }

    handleCartUpdate();
    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  const persistCoupon = (coupon: AppliedCoupon | null) => {
    setAppliedCoupon(coupon);
    if (coupon) {
      sessionStorage.setItem(APPLIED_COUPON_KEY, JSON.stringify(coupon));
    } else {
      sessionStorage.removeItem(APPLIED_COUPON_KEY);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const itemPrice = item.salePrice ?? item.price ?? 0;
    return sum + itemPrice * (item.quantity ?? 1);
  }, 0);

  const discount = appliedCoupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast.error('Enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await fetch('/api/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, items: cartItems }),
      });
      const data = await response.json();

      if (!response.ok || !data.valid) {
        throw new Error(data?.message || 'Invalid coupon code');
      }

      persistCoupon({
        code: data.couponCode || code.toUpperCase(),
        couponName: data.couponName,
        couponTitle: data.couponTitle,
        discountAmount: data.discountAmount ?? 0,
        discountPercentage: data.discountPercentage,
        discountType: data.discountType,
      });
      setCouponInput('');
      toast.success('Coupon applied', {
        description: data.couponTitle
          ? `${data.couponTitle} — ${formatPrice(data.discountAmount ?? 0, storeCurrency)} off`
          : undefined,
      });
    } catch (error: any) {
      persistCoupon(null);
      toast.error('Coupon not applied', {
        description: error?.message || 'Please check the code and try again.',
      });
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    persistCoupon(null);
    setCouponInput('');
    toast.message('Coupon removed');
  };

  const handleInputChange = (field: string, value: string) => {
    setCustomerForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleProceed = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const contentIds = cartItems
      .map((item) => String(item.sku || item.variationId || item.id || ''))
      .filter(Boolean);
    const contents = cartItems.map((item) => ({
      id: String(item.sku || item.variationId || item.id || ''),
      quantity: Number(item.quantity) || 1,
      item_price: Number(item.salePrice ?? item.price ?? 0) || 0,
    }));
    const numItems = cartItems.reduce(
      (sum, item) => sum + (Number(item.quantity) || 1),
      0
    );

    trackInitiateCheckout({
      content_ids: contentIds,
      contents,
      currency: currencyCode(storeCurrency),
      value: total,
      num_items: numItems,
    });

    setDialogOpen(true);
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customerForm.name || !customerForm.phone || !customerForm.address) {
      toast.error('Please add name, phone, and address');
      return;
    }

    setIsSubmitting(true);

    try {
      let couponForOrder = appliedCoupon;

      if (appliedCoupon) {
        const couponResponse = await fetch('/api/coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: appliedCoupon.code, items: cartItems }),
        });
        const couponData = await couponResponse.json();
        if (!couponResponse.ok || !couponData.valid) {
          persistCoupon(null);
          throw new Error(couponData?.message || 'Coupon is no longer valid for this cart');
        }
        couponForOrder = {
          code: couponData.couponCode || appliedCoupon.code,
          couponName: couponData.couponName,
          couponTitle: couponData.couponTitle,
          discountAmount: couponData.discountAmount ?? 0,
          discountPercentage: couponData.discountPercentage,
          discountType: couponData.discountType,
        };
        persistCoupon(couponForOrder);
      }

      const customerResponse = await fetch('/api/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: customerForm.name,
          phone: customerForm.phone,
          email: customerForm.email,
        }),
      });

      const customerData = await customerResponse.json();
      if (!customerResponse.ok) {
        throw new Error(customerData?.message || 'Failed to create customer');
      }

      const invoiceResponse = await fetch('/api/sale-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData?.data?.name || customerForm.name,
          items: cartItems,
          currency: storeCurrency || "PKR",
          shipping: { ...customerForm },
          companyId: necessary?.companyId,
          storeId: necessary?.storeId,
          coupon: couponForOrder
            ? {
                couponName: couponForOrder.couponName,
                code: couponForOrder.code,
                discountAmount: couponForOrder.discountAmount,
                discountPercentage: couponForOrder.discountPercentage,
                discountType: couponForOrder.discountType,
              }
            : undefined,
        }),
      });

      const invoiceData = await invoiceResponse.json();
      if (!invoiceResponse.ok) {
        throw new Error(invoiceData?.message || 'Failed to create sales invoice');
      }

      toast.success('Order created successfully', {
        description: invoiceData?.data?.name
          ? `Invoice #${invoiceData.data.name}`
          : 'Sales invoice created',
      });

      const contentIds = cartItems
        .map((item) => String(item.sku || item.variationId || item.id || ''))
        .filter(Boolean);
      const contents = cartItems.map((item) => ({
        id: String(item.sku || item.variationId || item.id || ''),
        quantity: Number(item.quantity) || 1,
        item_price: Number(item.salePrice ?? item.price ?? 0) || 0,
      }));

      trackPurchase({
        content_ids: contentIds,
        contents,
        currency: currencyCode(storeCurrency),
        value: total,
        content_name: invoiceData?.data?.name
          ? `Invoice ${invoiceData.data.name}`
          : 'Order',
      });

      sessionStorage.removeItem('cart');
      sessionStorage.removeItem(APPLIED_COUPON_KEY);
      setCartItems([]);
      setAppliedCoupon(null);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      setDialogOpen(false);
    } catch (error: any) {
      toast.error('Unable to complete order', {
        description: error?.message || 'Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="lg:sticky lg:top-24">
        <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-slate-900">Order summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShoppingBag className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">Your cart is empty</p>
              <Button variant="outline" className="mt-4 rounded-lg" asChild>
                <Link href="/shop">Continue shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="lg:sticky lg:top-24">
      <Card className="rounded-2xl border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 px-4 py-3 pb-3 sm:px-6 sm:py-4 sm:pb-4">
          <CardTitle className="text-base sm:text-lg font-semibold text-slate-900">Order summary</CardTitle>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Item list */}
          <div className="max-h-[200px] sm:max-h-[240px] overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
            <ul className="space-y-3">
              {cartItems.map((item, index) => {
                const itemPrice = item.salePrice ?? item.price ?? 0;
                const qty = item.quantity ?? 1;
                const itemTotal = itemPrice * qty;
                return (
                  <li key={`${item.id}-${index}`} className="flex justify-between gap-3 text-sm">
                    <span className="text-slate-700 truncate flex-1 min-w-0">
                      {item.name}
                      <span className="text-slate-400 font-normal"> × {qty}</span>
                    </span>
                    <span className="font-medium text-slate-900 shrink-0 tabular-nums">
                      {formatPrice(itemTotal, item.currency ?? storeCurrency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <Separator className="bg-slate-100" />

          {/* Coupon code */}
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-100">
            {appliedCoupon ? (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Tag className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-emerald-900 truncate">
                      {appliedCoupon.code}
                    </p>
                    {appliedCoupon.couponTitle && (
                      <p className="text-xs text-emerald-700 truncate">
                        {appliedCoupon.couponTitle}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
                  onClick={handleRemoveCoupon}
                  aria-label="Remove coupon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="h-10 rounded-lg border-slate-200 text-sm uppercase"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-lg px-4"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponInput.trim()}
                >
                  {isApplyingCoupon ? 'Checking…' : 'Apply'}
                </Button>
              </div>
            )}
          </div>

          <div className="px-4 py-3 space-y-2 sm:px-6 sm:py-4 sm:space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium text-slate-900 tabular-nums">
                {formatPrice(subtotal, storeCurrency)}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">
                  Discount
                  {appliedCoupon?.discountPercentage
                    ? ` (${appliedCoupon.discountPercentage}%)`
                    : ''}
                </span>
                <span className="font-medium text-emerald-700 tabular-nums">
                  −{formatPrice(discount, storeCurrency)}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-3 text-sm">
              <span className="text-slate-600">Shipping</span>
              <span className="font-medium text-slate-700 text-right">
                According to your location
              </span>
            </div>
          </div>

          <Separator className="bg-slate-100" />

          <div className="px-4 py-3 sm:px-6 sm:py-4 flex justify-between items-baseline">
            <span className="text-sm sm:text-base font-semibold text-slate-900">Total</span>
            <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
              {formatPrice(total, storeCurrency)}
            </span>
          </div>

          <div className="px-4 pb-5 pt-0 space-y-3 sm:px-6 sm:pb-6">
            <Button
              className="w-full rounded-xl h-11 sm:h-12 font-semibold bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white"
              onClick={handleProceed}
            >
              Proceed to checkout
            </Button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Secure checkout
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-1.25rem)] sm:max-w-md rounded-xl sm:rounded-2xl border-slate-200 p-4 sm:p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-semibold text-slate-900">
              Shipping details
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-slate-600">
              Enter your contact and delivery details to place the order.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-3 sm:space-y-4" onSubmit={submitOrder}>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs sm:text-sm text-slate-700">Customer name</Label>
              <Input
                id="name"
                value={customerForm.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="John Doe"
                required
                className="h-9 sm:h-10 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs sm:text-sm text-slate-700">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="h-9 sm:h-10 rounded-lg border-slate-200 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs sm:text-sm text-slate-700">Phone</Label>
                <Input
                  id="phone"
                  value={customerForm.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+92 300 0000000"
                  required
                  className="h-9 sm:h-10 rounded-lg border-slate-200 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs sm:text-sm text-slate-700">Shipping address</Label>
              <Textarea
                id="address"
                value={customerForm.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street, house no, area"
                required
                className="rounded-lg border-slate-200 min-h-[64px] sm:min-h-[80px] text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-xs sm:text-sm text-slate-700">City</Label>
              <Input
                id="city"
                value={customerForm.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="City"
                className="h-9 sm:h-10 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs sm:text-sm text-slate-700">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={customerForm.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any delivery instructions"
                className="rounded-lg border-slate-200 min-h-[52px] sm:min-h-[60px] text-sm"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 pt-1.5 sm:pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
                className="rounded-lg h-9 sm:h-10 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px] sm:min-w-[160px] h-9 sm:h-10 rounded-lg text-sm bg-[var(--primary-color)] hover:bg-[var(--primary-hover)]"
              >
                {isSubmitting ? 'Processing…' : 'Place order'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderSummary;
