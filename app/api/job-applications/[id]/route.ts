import { NextResponse } from "next/server";
import {
  getJobApplicant,
  parseMessage,
  parsePosition,
} from "@/lib/erpnext/services/jobApplicantService";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicant = await getJobApplicant(id);

    if (!applicant) {
      return NextResponse.json(
        { success: false, message: "Candidate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
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
      },
    });
  } catch (error: any) {
    console.error("Get job application error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to load candidate" },
      { status: 500 }
    );
  }
}
