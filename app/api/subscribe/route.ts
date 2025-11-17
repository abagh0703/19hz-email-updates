import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseClient } from '@/lib/supabase';
import { SubscribeResponse } from '@/lib/types';

// Validation schema
const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  location: z.string().min(1, 'Location is required'),
});

export async function POST(request: NextRequest): Promise<NextResponse<SubscribeResponse>> {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = subscribeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.errors[0].message,
        },
        { status: 400 }
      );
    }

    const { email, location } = validation.data;
    const supabase = getSupabaseClient();

    // Get or create user
    let userId: string;
    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else {
      const { data: newUser, error: userCreateError } = await supabase
        .from('users')
        .insert({ email })
        .select('id')
        .single();

      if (userCreateError || !newUser) {
        console.error('Error creating user:', userCreateError);
        return NextResponse.json(
          {
            success: false,
            message: 'Failed to create user account',
          },
          { status: 500 }
        );
      }

      userId = newUser.id;
    }

    // Get hardstyle category (hardcoded for now)
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'hardstyle')
      .single();

    if (categoryError || !category) {
      console.error('Error fetching category:', categoryError);
      return NextResponse.json(
        {
          success: false,
          message: 'Category not found',
        },
        { status: 500 }
      );
    }

    // Get location by name
    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('name', location)
      .single();

    if (locationError || !locationData) {
      console.error('Error fetching location:', locationError);
      return NextResponse.json(
        {
          success: false,
          message: 'Location not found',
        },
        { status: 400 }
      );
    }

    // Check if subscription already exists
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('id, is_active')
      .eq('user_id', userId)
      .eq('category_id', category.id)
      .eq('location_id', locationData.id)
      .single();

    if (existingSubscription) {
      if (existingSubscription.is_active) {
        return NextResponse.json({
          success: true,
          message: 'You are already subscribed to this location!',
        });
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existingSubscription.id);

        if (updateError) {
          console.error('Error reactivating subscription:', updateError);
          return NextResponse.json(
            {
              success: false,
              message: 'Failed to reactivate subscription',
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed! You will receive weekly event updates.',
        });
      }
    }

    // Create new subscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        category_id: category.id,
        location_id: locationData.id,
        is_active: true,
      });

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to create subscription',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! You will receive weekly hardstyle event updates.',
    });

  } catch (error) {
    console.error('Error in subscribe endpoint:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}


