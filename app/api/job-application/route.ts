import { NextResponse } from "next/server";
import dotenv from "dotenv";
import { revalidatePath } from "next/cache";
import { attachFileToDoc } from "@/lib/erpnext/uploadFile";
import {
  isAllowedCvImage,
  MAX_CV_IMAGE_SIZE_BYTES,
  MAX_CV_IMAGE_SIZE_MB,
} from "@/lib/careersUpload";

dotenv.config();

const ERP_BASE_URL = `https://${process.env.NEXT_PUBLIC_ERPNEXT_DOMAIN}/api/resource`;
const API_KEY = process.env.NEXT_PUBLIC_ERPNEXT_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_ERPNEXT_API_SECRET;

async function createJobApplicant(data: {
  applicant_name: string;
  email_id: string;
  phone_number: string;
  cover_letter?: string;
  job_title?: string;
}): Promise<{ success: boolean; name?: string; message?: string }> {
  const payload: Record<string, string> = {
    doctype: "Job Applicant",
    applicant_name: data.applicant_name,
    email_id: data.email_id,
    phone_number: data.phone_number,
    status: "Open",
    source: "Website - Public",
  };

  if (data.cover_letter) {
    payload.cover_letter = data.cover_letter;
  }

  if (data.job_title) {
    payload.job_title = data.job_title;
  }

  const response = await fetch(`${ERP_BASE_URL}/Job%20Applicant`, {
    method: "POST",
    headers: {
      Authorization: `token ${API_KEY}:${API_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      json?.message ||
      json?.exception ||
      json?._server_messages ||
      "Failed to create job application in ERPNext";
    return { success: false, message: String(message) };
  }

  return { success: true, name: json?.data?.name };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const applicant_name = String(formData.get("applicant_name") || "").trim();
    const email_id = String(formData.get("email_id") || "").trim();
    const phone_number = String(formData.get("phone_number") || "").trim();
    const designation = String(formData.get("designation") || "").trim();
    const cover_letter = String(formData.get("cover_letter") || "").trim();
    const job_title = String(formData.get("job_title") || "").trim();
    const cvFile = formData.get("cv");

    if (!applicant_name || !email_id || !phone_number) {
      return NextResponse.json(
        { success: false, message: "Name, email, and phone are required." },
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email_id)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      return NextResponse.json(
        { success: false, message: "Please upload a CV image (JPG, PNG, or WebP)." },
        { status: 400 }
      );
    }

    if (cvFile.size > MAX_CV_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: `CV image must be ${MAX_CV_IMAGE_SIZE_MB} MB or smaller.` },
        { status: 400 }
      );
    }

    if (!isAllowedCvImage(cvFile)) {
      return NextResponse.json(
        {
          success: false,
          message: "CV must be an image file (.jpg, .jpeg, .png, .webp, or .gif).",
        },
        { status: 400 }
      );
    }

    const fullCoverLetter = [
      designation ? `Position Applied For: ${designation}` : "",
      cover_letter,
    ]
      .filter(Boolean)
      .join("\n\n");

    const applicantResult = await createJobApplicant({
      applicant_name,
      email_id,
      phone_number,
      cover_letter: fullCoverLetter || undefined,
      job_title: job_title || undefined,
    });

    if (!applicantResult.success || !applicantResult.name) {
      return NextResponse.json(
        {
          success: false,
          message:
            applicantResult.message ||
            "Could not save your application. Make sure the HR module is enabled in ERPNext.",
        },
        { status: 500 }
      );
    }

    const fileBuffer = Buffer.from(await cvFile.arrayBuffer());
    const uploadResult = await attachFileToDoc({
      doctype: "Job Applicant",
      docname: applicantResult.name,
      filename: cvFile.name,
      fileBuffer,
      isPrivate: true,
      docfield: "resume_link",
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            uploadResult.message ||
            "Application was saved but CV upload failed. Please contact us directly.",
          applicantId: applicantResult.name,
        },
        { status: 500 }
      );
    }

    revalidatePath("/careers");

    return NextResponse.json({
      success: true,
      message: "Your application has been submitted successfully!",
      applicantId: applicantResult.name,
      candidate: {
        id: applicantResult.name,
        name: applicant_name,
        email: email_id,
        phone: phone_number,
        position: designation || null,
        message: cover_letter,
        submittedAt: new Date().toISOString(),
        hasCv: true,
        cvFilename: cvFile.name,
      },
    });
  } catch (error: any) {
    console.error("Job application error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
