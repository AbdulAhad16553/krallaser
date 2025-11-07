"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerService } from "@/lib/erpnext/services/customerService";
import { Zap } from "lucide-react";

interface NecessaryProps {
  companyId: string;
  storeId: string;
}

interface QuotationFormProps {
  productName: string;
  productSku: string;
  necessary: NecessaryProps;
  variationInfo?: string; // Optional variation information for variable products
}

const QuotationForm = ({
  productName,
  productSku,
  necessary,
  variationInfo,
}: QuotationFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      budget: "",
      instructions: "",
    },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Create quotation using ERPNext customer service
      const quotationData = {
        customer: data.email, // Use email as customer identifier
        customer_name: data.name,
        transaction_date: new Date().toISOString().split('T')[0],
        valid_till: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        status: 'Draft',
        grand_total: 0,
        currency: 'USD',
        items: [{
          item_code: productSku || productName || "N/A",
          item_name: productName,
          qty: 1,
          rate: 0,
          amount: 0
        }],
        notes: variationInfo
          ? `${data?.instructions}\n\nSelected Variation: ${variationInfo}`
          : data?.instructions,
        budget_range: data?.budget,
        contact_email: data?.email,
        contact_phone: data?.phone
      };

      // Create quotation in ERPNext
      const quotation = await customerService.createQuotation(quotationData);
      
      if (quotation) {
        reset();
        setOpen(false);
        toast.success("Quote Request Submitted Successfully!", {
          description: "We'll get back to you within 24 hours with a detailed quote.",
        });
      } else {
        throw new Error("Failed to submit quotation request");
      }
    } catch (error: any) {
      console.error("Error submitting quotation:", error);
      setSubmitError(
        error?.message || "Failed to submit quotation request. Please try again."
      );
      toast.error("Failed to submit quotation request", {
        description: error?.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Zap className="mr-2 h-4 w-4" />
          Request Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request a Quote</DialogTitle>
          <DialogDescription>
            Get a personalized quote for {productName}. We'll get back to you
            within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <p className="text-red-600 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="Enter your phone number"
              {...register("phone", { required: "Phone number is required" })}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Input
              id="budget"
              placeholder="e.g., $1000 - $5000"
              {...register("budget")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Requirements & Instructions</Label>
            <Textarea
              id="instructions"
              placeholder="Tell us about your specific requirements..."
              {...register("instructions", { required: "Please provide your requirements" })}
              rows={4}
            />
            {errors.instructions && (
              <p className="text-red-600 text-sm">{errors.instructions.message}</p>
            )}
          </div>

          {submitError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {submitError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuotationForm;