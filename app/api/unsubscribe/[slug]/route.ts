import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/crypto';
import { UnsubscribeResponse } from '@/lib/types';

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<UnsubscribeResponse>> {
  try {
    const slug = params.slug;
    
    // Parse token.sig format
    const parts = slug.split('.');
    if (parts.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid unsubscribe link format',
        },
        { status: 400 }
      );
    }

    const [token, signature] = parts;

    // Verify HMAC signature
    if (!verifyToken(token, signature)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid unsubscribe link',
        },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if subscription exists
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('id, is_active')
      .eq('id', token)
      .single();

    if (fetchError || !subscription) {
      console.error('Error fetching subscription:', fetchError);
      return NextResponse.json(
        {
          success: false,
          message: 'Subscription not found',
        },
        { status: 404 }
      );
    }

    // If already inactive, return success (idempotent)
    if (!subscription.is_active) {
      return NextResponse.json(
        {
          success: true,
          message: 'Already unsubscribed',
        },
        { status: 200 }
      );
    }

    // Mark subscription as inactive
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', token);

    if (updateError) {
      console.error('Error updating subscription:', updateError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to unsubscribe',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully unsubscribed',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in unsubscribe endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}


