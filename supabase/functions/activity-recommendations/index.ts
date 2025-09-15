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

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return new Response(JSON.stringify({ error: 'Error fetching profile: ' + profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!profile) {
      console.warn('Profile not found for user:', user.id, '- using default profile for recommendations');
    }
    const effectiveProfile = profile ?? { role: 'student', department: '' };

    // Get user's activity history
    const { data: activityHistory, error: historyError } = await supabase
      .from('user_activity_history')
      .select('activity_id, completion_status, feedback_rating')
      .eq('user_id', user.id);

    if (historyError) {
      console.error('Error fetching activity history:', historyError);
    }

    // Get user's attendance stats
    const { data: attendanceRecords, error: attendanceError } = await supabase
      .from('attendance')
      .select('status')
      .eq('student_id', user.id);

    if (attendanceError) {
      console.error('Error fetching attendance records:', attendanceError);
    }

    // Get all available activities
    const { data: allActivities, error: activitiesError } = await supabase
      .from('activities')
      .select('*')
      .eq('is_active', true);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Calculate recommendation scores using simple ML-like logic
    const recommendations = generateRecommendations(
      effectiveProfile,
      activityHistory || [],
      attendanceRecords || [],
      allActivities || []
    );

    return new Response(JSON.stringify({ 
      recommendations: recommendations.slice(0, 5),
      user_stats: {
        activities_completed: activityHistory?.filter(h => h.completion_status === 'completed').length || 0,
        attendance_rate: calculateAttendanceRate(attendanceRecords || [])
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in activity-recommendations function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateRecommendations(profile: any, activityHistory: any[], attendanceRecords: any[], allActivities: any[]) {
  const participatedActivityIds = new Set(activityHistory.map(h => h.activity_id));
  const attendanceRate = calculateAttendanceRate(attendanceRecords);
  
  return allActivities
    .filter(activity => !participatedActivityIds.has(activity.id))
    .map(activity => {
      let score = 50; // Base score
      
      // Department/field match scoring
      if (activity.target_roles?.includes('student') || activity.target_roles?.includes(profile.role)) {
        score += 20;
      }
      
      // Department-specific recommendations
      if (profile.department && activity.tags) {
        const departmentKeywords = profile.department.toLowerCase().split(' ');
        const activityTags = activity.tags.map((tag: string) => tag.toLowerCase());
        
        for (const keyword of departmentKeywords) {
          if (activityTags.some((tag: string) => tag.includes(keyword))) {
            score += 15;
          }
        }
      }
      
      // Attendance-based recommendations
      if (attendanceRate < 0.7) {
        const attendanceBoostTags = ['time management', 'attendance', 'discipline', 'habits'];
        if (activity.tags?.some((tag: string) => 
          attendanceBoostTags.some(boostTag => 
            tag.toLowerCase().includes(boostTag)
          )
        )) {
          score += 25;
        }
      }
      
      // Activity type preferences
      if (activity.activity_type === 'career') {
        score += 10; // Boost career-focused activities
      }
      
      // Difficulty matching (easier activities for struggling students)
      if (attendanceRate < 0.6 && activity.difficulty_level === 'beginner') {
        score += 15;
      }
      
      // Duration preferences (shorter activities for busy students)
      if (activity.duration_minutes && activity.duration_minutes <= 60) {
        score += 10;
      }
      
      return {
        ...activity,
        recommendation_score: score,
        recommendation_reason: generateRecommendationReason(activity, profile, attendanceRate)
      };
    })
    .sort((a, b) => b.recommendation_score - a.recommendation_score);
}

function calculateAttendanceRate(attendanceRecords: any[]): number {
  if (attendanceRecords.length === 0) return 1.0;
  const presentCount = attendanceRecords.filter(record => record.status === 'present').length;
  return presentCount / attendanceRecords.length;
}

function generateRecommendationReason(activity: any, profile: any, attendanceRate: number): string {
  const reasons = [];
  
  if (profile.department && activity.tags?.some((tag: string) => 
    tag.toLowerCase().includes(profile.department.toLowerCase())
  )) {
    reasons.push(`Matches your ${profile.department} field`);
  }
  
  if (attendanceRate < 0.7 && activity.tags?.some((tag: string) => 
    ['time management', 'attendance', 'discipline'].includes(tag.toLowerCase())
  )) {
    reasons.push('Helps improve attendance habits');
  }
  
  if (activity.activity_type === 'career') {
    reasons.push('Career development focus');
  }
  
  if (activity.duration_minutes && activity.duration_minutes <= 60) {
    reasons.push('Quick to complete');
  }
  
  return reasons.length > 0 ? reasons.join(' • ') : 'Recommended for you';
}