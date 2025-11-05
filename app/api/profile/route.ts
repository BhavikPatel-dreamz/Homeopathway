import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { updateUserProfile, updateUserEmail, updateUserPassword, getUserProfileById } from '../../../lib/profileUtils';

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - user not authenticated' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { full_name, email, password } = body;

    // Validate input
    if (!full_name || full_name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Full name is required' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Split full name into first and last name
    const nameParts = full_name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Update profile in the profiles table
    const { error: profileError } = await updateUserProfile(user.id, {
      first_name: firstName,
      last_name: lastName
    });

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { error: 'Failed to update profile information' },
        { status: 500 }
      );
    }

    // Update auth user email if changed
    if (email && email !== user.email) {
      const { error: emailError } = await updateUserEmail(user.id, email);
      
      if (emailError) {
        console.error('Email update error:', emailError);
        return NextResponse.json(
          { error: 'Failed to update email. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Update password if provided
    if (password && password.trim()) {
      const { error: passwordError } = await updateUserPassword(password);
      
      if (passwordError) {
        console.error('Password update error:', passwordError);
        return NextResponse.json(
          { error: 'Failed to update password. Please try again.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - user not authenticated' },
        { status: 401 }
      );
    }

    // Get profile from profiles table
    const { profile, error: profileError } = await getUserProfileById(user.id);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profile: {
        id: user.id,
        email: profile.email || user.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        role: profile.role || 'user'
      }
    });

  } catch (error) {
    console.error('Profile fetch API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}