import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!;
const TAB_NAME = process.env.GOOGLE_SHEETS_TAB_NAME || "External";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error("Missing Google service account env vars");
  }

  return new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      source = "",
      company = "",
      role = "",
      yoe = "",
      pay = "",
      link = "",
      applied = "",
      appliedDate = "",
      responded = "",
    } = body;

    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

 
    const values = [
      [
        "", 
        source,
        company,
        role,
        yoe,
        pay,
        link,
        applied,
        appliedDate,
        responded,
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TAB_NAME}!A:Z`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Error adding job:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { ok: false, error: errorMessage },
      { status: 500 }
    );
  }
}

