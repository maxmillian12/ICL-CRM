import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ message: "Logged out" }); }
export async function OPTIONS() { return new NextResponse(null, { status: 204 }); }
