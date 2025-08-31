/**
 * News Interaction API - Supabase Edge Function
 * Tracks user interactions with medical news articles and manages bookmarks
 * Migrated from Netlify Functions to Supabase Edge Functions
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface InteractionRequest {
  newsId: string;
  interactionType: 'click' | 'read_time' | 'share' | 'bookmark' | 'like' | 'comment' | 'save_later';
  interactionValue?: number; // For read_time in seconds, etc.
  interactionMetadata?: Record<string, any>; // Additional context
  sessionId?: string;
  referrerUrl?: string;
}

// Store news interaction
async function storeNewsInteraction(
  userId: string,
  interaction: InteractionRequest,
  userAgent: string,
  ipAddress: string
) {
  try {
    const interactionData = {
      user_id: userId,
      news_id: interaction.newsId,
      interaction_type: interaction.interactionType,
      interaction_value: interaction.interactionValue || null,
      interaction_metadata: interaction.interactionMetadata || null,
      session_id: interaction.sessionId || null,
      ip_address: ipAddress,
      user_agent: userAgent,
      referrer_url: interaction.referrerUrl || null
    };

    const { data: insertedInteraction, error } = await supabase
      .from('news_user_interactions')
      .insert(interactionData)
      .select()
      .single();

    if (error) {
      console.error('Database insert failed:', error);
      throw new Error(`Database insert failed: ${error.message}`);
    }

    // Update click count if it's a click interaction
    if (interaction.interactionType === 'click') {
      await updateClickCount(interaction.newsId);
    }

    return insertedInteraction.id;

  } catch (error) {
    console.error('Failed to store interaction:', error);
    throw error;
  }
}

// Update click count for the article
async function updateClickCount(newsId: string): Promise<void> {
  try {
    // Use the database function we created
    const { error } = await supabase.rpc('increment_news_click_count', {
      news_id: newsId
    });

    if (error) {
      console.error('Failed to update click count:', error);
    }
  } catch (error) {
    console.error('Error updating click count:', error);
    // Don't throw error - clicking should work even if count update fails
  }
}

// Get bookmarked news for user
async function getBookmarkedNews(userId: string) {
  try {
    // First, get the bookmark interactions
    const { data: interactions, error: interactionsError } = await supabase
      .from('news_user_interactions')
      .select('news_id, created_at')
      .eq('user_id', userId)
      .eq('interaction_type', 'bookmark')
      .order('created_at', { ascending: false });

    if (interactionsError) {
      console.error('Failed to fetch bookmark interactions:', interactionsError);
      throw new Error(`Failed to fetch bookmark interactions: ${interactionsError.message}`);
    }

    if (!interactions || interactions.length === 0) {
      return [];
    }

    // Extract unique news IDs
    const newsIds = [...new Set(interactions.map(i => i.news_id))];

    // Fetch the actual news articles
    const { data: articles, error: articlesError } = await supabase
      .from('medical_news')
      .select('*')
      .in('id', newsIds)
      .order('published_at', { ascending: false });

    if (articlesError) {
      console.error('Failed to fetch bookmarked news:', articlesError);
      throw new Error(`Failed to fetch bookmarked news: ${articlesError.message}`);
    }

    return articles || [];

  } catch (error) {
    console.error('Failed to get bookmarked news:', error);
    throw error;
  }
}

// Remove bookmark for a news article
async function removeBookmark(userId: string, newsId: string) {
  try {
    const { error } = await supabase
      .from('news_user_interactions')
      .delete()
      .eq('user_id', userId)
      .eq('news_id', newsId)
      .eq('interaction_type', 'bookmark');

    if (error) {
      console.error('Failed to remove bookmark:', error);
      throw new Error(`Failed to remove bookmark: ${error.message}`);
    }

    return { message: 'Bookmark removed successfully' };

  } catch (error) {
    console.error('Failed to remove bookmark:', error);
    throw error;
  }
}

// Validate interaction request
function validateInteractionRequest(body: any): InteractionRequest | null {
  if (!body.newsId || typeof body.newsId !== 'string') {
    return null;
  }
  
  const validInteractionTypes = ['click', 'read_time', 'share', 'bookmark', 'like', 'comment', 'save_later'];
  if (!body.interactionType || !validInteractionTypes.includes(body.interactionType)) {
    return null;
  }
  
  // Validate interaction value if provided
  if (body.interactionValue !== undefined) {
    if (typeof body.interactionValue !== 'number' || body.interactionValue < 0) {
      return null;
    }
    
    // Specific validation for read_time
    if (body.interactionType === 'read_time' && body.interactionValue > 3600) { // Max 1 hour
      return null;
    }
  }
  
  return {
    newsId: body.newsId,
    interactionType: body.interactionType,
    interactionValue: body.interactionValue,
    interactionMetadata: body.interactionMetadata,
    sessionId: body.sessionId,
    referrerUrl: body.referrerUrl
  };
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Authentication failed')
    }

    const url = new URL(req.url);
    const params = new URLSearchParams(url.search);
    
    let result;

    if (req.method === 'GET') {
      // Get bookmarked news articles
      const bookmarkedArticles = await getBookmarkedNews(user.id);
      
      result = {
        success: true,
        data: {
          bookmarkedArticles,
          totalCount: bookmarkedArticles.length
        }
      };
      
    } else if (req.method === 'POST') {
      // Track news interaction
      const body = await req.json();
      const interaction = validateInteractionRequest(body);
      
      if (!interaction) {
        throw new Error('Invalid interaction request');
      }

      const userAgent = req.headers.get('User-Agent') || '';
      const ipAddress = req.headers.get('cf-connecting-ip') || 
                       req.headers.get('x-forwarded-for') || 
                       'unknown';

      const interactionId = await storeNewsInteraction(
        user.id,
        interaction,
        userAgent,
        ipAddress
      );

      result = {
        success: true,
        data: {
          interactionId,
          message: 'Interaction recorded successfully'
        }
      };
      
    } else if (req.method === 'DELETE') {
      // Remove bookmark
      const newsId = params.get('newsId');
      
      if (!newsId) {
        throw new Error('Missing newsId parameter');
      }
      
      const response = await removeBookmark(user.id, newsId);
      
      result = {
        success: true,
        data: response
      };
      
    } else {
      throw new Error('Method not allowed');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('News interaction API error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const statusCode = errorMessage.includes('Authentication') ? 401 : 
                      errorMessage.includes('Method not allowed') ? 405 :
                      errorMessage.includes('Missing') ? 400 : 500;

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    )
  }
})