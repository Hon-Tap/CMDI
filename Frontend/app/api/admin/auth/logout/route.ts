import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/adminAuth";

/**
 * Handles admin logout by clearing the session cookie.
 */
export async function POST() {
  try {
    // We must await this because the new adminAuth uses async cookies()
    await clearAdminCookie();

    return NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error: any) {
    console.error("LOGOUT_ERROR:", error.message);
    
    return NextResponse.json(
      { error: "Failed to clear session" },
      { status: 500 }
    );
  }
}