"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Globe, Image, Loader2, Upload, X } from "lucide-react";
import { notifyCareersListRefresh } from "@/lib/careersListRefresh";
import {
  CV_IMAGE_ACCEPT,
  isAllowedCvImage,
  MAX_CV_IMAGE_SIZE_MB,
} from "@/lib/careersUpload";

interface FormValues {
  applicant_name: string;
  email_id: string;
  phone_number: string;
  designation: string;
  cover_letter: string;
  public_consent: boolean;
}

const MAX_CV_SIZE_MB = MAX_CV_IMAGE_SIZE_MB;

export default function CareerApplicationForm() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      applicant_name: "",
      email_id: "",
      phone_number: "",
      designation: "",
      cover_letter: "",
      public_consent: false,
    },
  });

  const publicConsent = watch("public_consent");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_CV_SIZE_MB * 1024 * 1024) {
      toast.error(`CV image must be ${MAX_CV_SIZE_MB} MB or smaller.`);
      event.target.value = "";
      return;
    }

    if (!isAllowedCvImage(file)) {
      toast.error("Please upload a JPG, PNG, WebP, or GIF image.");
      event.target.value = "";
      return;
    }

    if (cvPreviewUrl) URL.revokeObjectURL(cvPreviewUrl);
    setCvPreviewUrl(URL.createObjectURL(file));
    setCvFile(file);
  };

  const removeFile = () => {
    setCvFile(null);
    if (cvPreviewUrl) {
      URL.revokeObjectURL(cvPreviewUrl);
      setCvPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: FormValues) => {
    if (!data.public_consent) {
      toast.error("Please agree to publish your profile publicly.");
      return;
    }

    if (!cvFile) {
      toast.error("Please upload your CV as an image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("applicant_name", data.applicant_name);
      formData.append("email_id", data.email_id);
      formData.append("phone_number", data.phone_number);
      if (data.designation) formData.append("designation", data.designation);
      if (data.cover_letter) formData.append("cover_letter", data.cover_letter);
      formData.append("cv", cvFile);

      const response = await fetch("/api/job-application", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProfileId(result.applicantId || null);
        setIsSuccess(true);
        reset();
        removeFile();
        notifyCareersListRefresh();
        toast.success("Profile published!", {
          description: "Your profile is now live on the talent board.",
        });
      } else {
        toast.error("Submission failed", {
          description: result.message || "Please try again later.",
        });
      }
    } catch (error: any) {
      toast.error("Something went wrong", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="pt-12 pb-12 text-center px-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Profile Published!</h2>
          <p className="text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
            Your profile is now live on the talent board. Companies can view your details, download
            your CV, and contact you directly.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {profileId && (
              <Button asChild className="talent-btn-primary rounded-full px-8">
                <Link href={`/careers/${encodeURIComponent(profileId)}`}>View My Profile</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="talent-btn-outline rounded-full px-8">
              <Link href="/careers">Browse All Candidates</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-red-50/50 border-b border-slate-100 px-6 sm:px-8 py-6">
        <h2 className="text-xl font-bold text-slate-900">Your Public Profile</h2>
        <p className="text-slate-600 text-sm mt-2 flex items-start gap-2 leading-relaxed">
          <Globe className="w-4 h-4 shrink-0 mt-0.5 text-[var(--primary-color)]" />
          Everything you submit will be visible to everyone — name, email, phone, message, and CV image.
        </p>
      </CardHeader>
      <CardContent className="px-6 sm:px-8 py-7">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="applicant_name" className="text-slate-700 font-medium">
                Full Name *
              </Label>
              <Input
                id="applicant_name"
                placeholder="Your full name"
                className="border-slate-200 rounded-xl h-11 focus-visible:ring-[var(--primary-color)]/30"
                {...register("applicant_name", { required: "Name is required" })}
              />
              {errors.applicant_name && (
                <p className="text-red-600 text-sm">{errors.applicant_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-slate-700 font-medium">
                Phone Number *
              </Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="+92 300 1234567"
                className="border-slate-200 rounded-xl h-11 focus-visible:ring-[var(--primary-color)]/30"
                {...register("phone_number", { required: "Phone number is required" })}
              />
              {errors.phone_number && (
                <p className="text-red-600 text-sm">{errors.phone_number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email_id" className="text-slate-700 font-medium">
              Email Address *
            </Label>
            <Input
              id="email_id"
              type="email"
              placeholder="you@example.com"
              className="border-slate-200 rounded-xl h-11 focus-visible:ring-[var(--primary-color)]/30"
              {...register("email_id", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email_id && (
              <p className="text-red-600 text-sm">{errors.email_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="designation" className="text-slate-700 font-medium">
              Role / Position You&apos;re Looking For
            </Label>
            <Input
              id="designation"
              placeholder="e.g. Sales Executive, Technician, Engineer"
              className="border-slate-200 rounded-xl h-11 focus-visible:ring-[var(--primary-color)]/30"
              {...register("designation")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_letter" className="text-slate-700 font-medium">
              About You / Skills & Experience
            </Label>
            <Textarea
              id="cover_letter"
              placeholder="Describe your experience, skills, and what kind of job you're looking for..."
              rows={4}
              className="border-slate-200 resize-none rounded-xl focus-visible:ring-[var(--primary-color)]/30"
              {...register("cover_letter")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv" className="text-slate-700 font-medium">
              Upload CV Image *
            </Label>
            <p className="text-xs text-slate-500 -mt-1">
              Take a photo or upload a screenshot of your CV — JPG, PNG, or WebP (max {MAX_CV_SIZE_MB} MB)
            </p>
            {!cvFile ? (
              <div
                className="border-2 border-dashed border-[var(--primary-color)]/25 rounded-xl p-8 sm:p-10 text-center hover:border-[var(--primary-color)]/45 hover:bg-red-50/30 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl talent-stat-icon flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                  <Image className="w-7 h-7" aria-hidden />
                </div>
                <p className="text-sm font-medium text-slate-700">Click to upload CV image</p>
                <p className="text-xs text-slate-400 mt-1.5">
                  JPG, PNG, WebP, or GIF · max {MAX_CV_SIZE_MB} MB
                </p>
                <input
                  ref={fileInputRef}
                  id="cv"
                  type="file"
                  accept={CV_IMAGE_ACCEPT}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-[var(--primary-color)]/20 bg-red-50/30 overflow-hidden">
                {cvPreviewUrl && (
                  <div className="relative bg-slate-100 max-h-64 overflow-hidden">
                    <img
                      src={cvPreviewUrl}
                      alt="CV preview"
                      className="w-full h-auto max-h-64 object-contain object-top mx-auto"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--primary-color)]/10">
                  <span className="truncate text-sm font-medium text-slate-700">{cvFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={removeFile}
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-xl border border-[var(--primary-color)]/15 bg-gradient-to-r from-red-50/80 to-orange-50/40">
            <Checkbox
              id="public_consent"
              checked={publicConsent}
              className="border-[var(--primary-color)]/40 data-[state=checked]:bg-[var(--primary-color)]"
              onCheckedChange={(checked) =>
                setValue("public_consent", checked === true, { shouldValidate: true })
              }
            />
            <div className="space-y-1">
              <Label htmlFor="public_consent" className="font-medium text-slate-900 cursor-pointer">
                I agree to publish my profile publicly *
              </Label>
              <p className="text-xs text-slate-600 leading-relaxed">
                I understand that my name, email, phone number, profile message, and CV image will be
                visible to everyone visiting this website, and any company may contact me.
              </p>
              {errors.public_consent && (
                <p className="text-red-600 text-sm">{errors.public_consent.message}</p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !publicConsent}
            className="w-full sm:w-auto talent-btn-primary rounded-full px-10 h-12 text-base font-semibold shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Publish My Profile
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
