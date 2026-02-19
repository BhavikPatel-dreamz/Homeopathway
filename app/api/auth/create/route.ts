/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Use the Admin API to create a user server-side. This does not send
    // the standard signup confirmation email the client flow triggers.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName ?? null,
        last_name: lastName ?? null,
      },
      // confirm the email on create so the user can sign in immediately
      email_confirm: true,
    });

    if (error) {
      const errPayload: any = {
        message: (error as any)?.message ?? String(error),
        status: (error as any)?.status ?? 400,
      };
      return NextResponse.json({ error: errPayload }, { status: 400 });
    }

    const user = (data as any)?.user ?? data;

    // Insert a profile row using the service client to avoid RLS issues.
    try {
      const userName = [firstName, lastName].filter(Boolean).join('-').toLowerCase();
      const { error: profileError } = await admin
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: firstName ?? null,
          last_name: lastName ?? null,
          role: 'user',
          user_name: userName || null,
        });

      if (profileError) {
        console.warn('Profile insert failed (server):', profileError);
      }
    } catch (e) {
      console.warn('Profile insert exception (server):', e);
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
