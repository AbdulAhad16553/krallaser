import { NextResponse } from "next/server";
import { listJobApplicants, parseMessage, parsePosition } from "@/lib/erpnext/services/jobApplicantService";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const applicants = await listJobApplicants();

    const publicList = applicants.map((applicant) => ({
      id: applicant.name,
      name: applicant.applicant_name,
      email: applicant.email_id,
      phone: applicant.phone_number,
      position: parsePosition(applicant.cover_letter),
      message: parseMessage(applicant.cover_letter),
      status: applicant.status,
      submittedAt: applicant.creation,
      hasCv: Boolean(applicant.resume_filename),
      cvFilename: applicant.resume_filename,
    }));

    return NextResponse.json(
      { success: true, data: publicList },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("List job applications error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load candidates" },
      { status: 500 }
    );
  }
}
