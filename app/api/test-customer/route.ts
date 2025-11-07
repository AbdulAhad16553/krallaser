import { NextResponse } from "next/server";
import { createCustomer } from "@/lib/testCustomerCreation";

export async function POST() {
  try {
    const result = await createCustomer();
    return NextResponse.json({ 
      success: true, 
      message: "Customer created successfully!",
      data: result 
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: error.response?.data?.message || error.message 
      },
      { status: 500 }
    );
  }
}

