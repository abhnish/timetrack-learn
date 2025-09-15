import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Check if we have recent news in database (within last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    
    let { data: existingNews } = await supabase
      .from('educational_news')
      .select('*')
      .gte('created_at', sixHoursAgo)
      .order('published_at', { ascending: false })
      .limit(5);

    // If we have recent news, return it
    if (existingNews && existingNews.length >= 3) {
      return new Response(JSON.stringify({ 
        news: existingNews,
        source: 'cache'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Otherwise, fetch fresh news and update database
    const freshNews = await fetchEducationalNews();
    
    // Store the news in database
    if (freshNews.length > 0) {
      const { error: insertError } = await supabase
        .from('educational_news')
        .insert(freshNews);

      if (insertError) {
        console.error('Error inserting news:', insertError);
      }
    }

    // Get the latest news from database (including what we just inserted)
    const { data: latestNews } = await supabase
      .from('educational_news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({ 
      news: latestNews || freshNews,
      source: 'fresh'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in educational-news function:', error);
    
    // Fallback to database news if API fails
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      );
      
      const { data: fallbackNews } = await supabase
        .from('educational_news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(5);
      
      return new Response(JSON.stringify({ 
        news: fallbackNews || [],
        source: 'fallback'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
      return new Response(JSON.stringify({ error: 'Unable to fetch news' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
});

async function fetchEducationalNews() {
  const newsItems = [];
  
  try {
    // Simulate fetching from multiple sources
    const educationKeywords = [
      'digital literacy program',
      'education ministry scheme',
      'student scholarship 2024',
      'online learning initiative',
      'skill development program'
    ];
    
    // Mock news data (in real implementation, you would fetch from actual APIs)
    const mockNews = [
      {
        title: "New Digital Literacy Program Launched",
        description: "The Ministry of Education announces a comprehensive digital literacy program for students across all educational institutions.",
        link: "https://education.gov.in/digital-literacy-2024",
        source: "Ministry of Education",
        category: "digital-education",
        published_at: new Date().toISOString()
      },
      {
        title: "Scholarship Opportunities for Engineering Students",
        description: "Government launches new scholarship scheme for engineering students with focus on emerging technologies.",
        link: "https://education.gov.in/engineering-scholarships",
        source: "Department of Higher Education",
        category: "scholarships",
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Skill Development Initiative in Rural Areas",
        description: "New initiative to provide skill development training in rural areas with emphasis on digital skills.",
        link: "https://skilldevelopment.gov.in/rural-initiative",
        source: "Ministry of Skill Development",
        category: "skill-development",
        published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Online Learning Platform for Government Schools",
        description: "Launch of comprehensive online learning platform specifically designed for government school students.",
        link: "https://education.gov.in/online-platform",
        source: "Department of School Education",
        category: "online-learning",
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        title: "Career Guidance Program for College Students",
        description: "New career guidance and counseling program launched to help college students make informed career decisions.",
        link: "https://education.gov.in/career-guidance",
        source: "Ministry of Education",
        category: "career-guidance",
        published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    // In a real implementation, you would:
    // 1. Call NewsAPI: https://newsapi.org/v2/everything?q=education+india+government&sortBy=publishedAt
    // 2. Parse RSS feeds from education.gov.in
    // 3. Fetch from other educational news sources
    
    return mockNews;
    
  } catch (error) {
    console.error('Error fetching educational news:', error);
    return [];
  }
}
