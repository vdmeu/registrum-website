import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { verifySessionCookie, SESSION_COOKIE } from "@/lib/dashboard-auth";
import { getSupabase } from "@/lib/supabase";

function generateKey(): { fullKey: string; prefix: string; keyHash: string } {
  const randomPart = crypto.randomBytes(16).toString("hex");
  const fullKey = `reg_live_${randomPart}`;
  const prefix = fullKey.slice(0, 14); // "reg_live_" (9) + 5 hex
  const keyHash = bcrypt.hashSync(fullKey, 10);
  return { fullKey, prefix, keyHash };
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(SESSION_COOKIE)?.value;
  const email = sessionValue ? verifySessionCookie(sessionValue) : null;

  if (!email) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const supabase = getSupabase();

  // Get the existing active key
  const { data: existing } = await supabase
    .from("api_keys")
    .select("id, plan, calls_this_month, month_reset_at")
    .eq("label", email)
    .eq("is_active", true)
    .limit(1);

  if (!existing || existing.length === 0) {
    return NextResponse.json({ error: "No active key found." }, { status: 404 });
  }

  const old = existing[0];
  const { fullKey, prefix, keyHash } = generateKey();

  // Deactivate old key
  await supabase.from("api_keys").update({ is_active: false }).eq("id", old.id);

  // Insert new key — carry over the plan and usage reset date
  const { error } = await supabase.from("api_keys").insert({
    key_prefix: prefix,
    key_hash: keyHash,
    plan: old.plan,
    label: email,
    calls_this_month: 0,
    month_reset_at: old.month_reset_at,
    is_active: true,
  });

  if (error) {
    // Roll back: re-activate the old key
    await supabase.from("api_keys").update({ is_active: true }).eq("id", old.id);
    return NextResponse.json({ error: "Rotation failed. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, new_key: fullKey });
}
