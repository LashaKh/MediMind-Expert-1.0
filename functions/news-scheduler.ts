/**
 * Simple scheduler that triggers Supabase news collection function
 * Runs on Netlify scheduled functions (twice daily)
 */

import { HandlerEvent, HandlerResponse } from '@netlify/functions';

const SUPABASE_URL = 'https://kvsqtolsjggpyvdtdpss.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const handler = async (event: HandlerEvent): Promise<HandlerResponse> => {
  try {
    console.log('📰 [NEWS-SCHEDULER] Triggering Supabase news collection...');
    
    if (!SUPABASE_ANON_KEY) {
      throw new Error('Supabase anon key not configured');
    }
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/news-collection`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ force: true })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`News collection failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    
    console.log('✅ [NEWS-SCHEDULER] News collection completed:', {
      totalArticles: result.totalArticlesProcessed,
      configurationsProcessed: result.configurationsProcessed
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'News collection triggered successfully',
        result
      })
    };
    
  } catch (error) {
    console.error('❌ [NEWS-SCHEDULER] Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};