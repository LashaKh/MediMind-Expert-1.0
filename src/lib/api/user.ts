import { supabase } from '../supabase';
import { TablesUpdate } from '../../types/supabase';

export interface UpdateUserProfileData {
  medical_specialty?: string;
  about_me_context?: string;
  full_name?: string;
}

/**
 * Update user profile information
 */
export const updateUserProfile = async (
  userId: string, 
  updates: UpdateUserProfileData
): Promise<void> => {
  try {
    // First, check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (!existingUser) {
      throw new Error('User profile not found');
    }

    // Perform the update
    const { error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Update profile error:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  } catch (err) {
    console.error('UpdateUserProfile error:', err);
    throw err;
  }
};

/**
 * Get user profile by user ID
 */
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Get user profile error:', error);
      
      // Handle specific error codes
      if (error.code === 'PGRST116') {
        throw new Error('User profile not found');
      }
      
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('getUserProfile error:', err);
    throw err;
  }
};

/**
 * Create a basic user profile after signup
 */
export const createUserProfile = async (userId: string, email: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        user_id: userId,
        email: email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      // If error is duplicate key (user already exists), that's fine
      if (error.code !== '23505') {
        throw new Error(`Failed to create profile: ${error.message}`);
      }
    }
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('Error creating profile');
    console.warn('Profile creation failed:', error);
    // Don't throw here to prevent blocking sign-up flow
  }
};

/**
 * Check if user has completed onboarding (has specialty selected)
 */
export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('users')
    .select('medical_specialty')
    .eq('user_id', userId)
    .single();

  if (error) {

    return false;
  }

  return !!data?.medical_specialty;
}; 