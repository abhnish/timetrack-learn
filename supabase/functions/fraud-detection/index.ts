import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FraudDetectionRequest {
  type: 'location_check' | 'security_log' | 'pattern_analysis';
  session_id?: string;
  location?: { lat: number; lng: number };
  device_info?: any;
  user_id?: string;
  event_type?: string;
  data?: any;
  timestamp?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { type, session_id, location, device_info, user_id, event_type, data, timestamp }: FraudDetectionRequest = await req.json();

    console.log(`Fraud detection request: ${type}`, { session_id, user_id, event_type });

    switch (type) {
      case 'location_check':
        return await handleLocationCheck(supabase, session_id!, location!, device_info, user_id!);
      
      case 'security_log':
        return await handleSecurityLog(supabase, event_type!, user_id!, data, timestamp!);
      
      case 'pattern_analysis':
        return await handlePatternAnalysis(supabase, user_id!);
      
      default:
        throw new Error('Invalid fraud detection type');
    }
  } catch (error) {
    console.error('Fraud detection error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleLocationCheck(
  supabase: any,
  sessionId: string,
  location: { lat: number; lng: number },
  deviceInfo: any,
  userId: string
) {
  let fraudScore = 0;
  const reasons = [];

  try {
    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      fraudScore += 40;
      reasons.push('Session not found or invalid');
    } else {
      // 1. Geofencing - check if user is within allowed radius
      if (session.location) {
        try {
          const sessionLocation = JSON.parse(session.location);
          const distance = calculateDistance(
            location.lat,
            location.lng,
            sessionLocation.lat,
            sessionLocation.lng
          );

          console.log(`Location check: distance ${distance}m from session location`);

          // Allow 200m radius for classroom attendance
          if (distance > 200) {
            fraudScore += 35;
            reasons.push(`Location too far from classroom (${Math.round(distance)}m away)`);
          }
        } catch (error) {
          console.log('Session location parsing error:', error);
          fraudScore += 10;
          reasons.push('Unable to verify session location');
        }
      }

      // 2. Check for location spoofing indicators
      if (deviceInfo) {
        // Rapid location changes indicate potential spoofing
        const recentLocations = await getRecentLocationHistory(supabase, userId);
        if (recentLocations.length > 0) {
          const lastLocation = recentLocations[0];
          const timeDiff = Date.now() - new Date(lastLocation.marked_at).getTime();
          
          if (timeDiff < 300000) { // Less than 5 minutes
            const locationDistance = calculateDistance(
              location.lat,
              location.lng,
              lastLocation.location_lat,
              lastLocation.location_lng
            );
            
            // Check for impossible travel speed (>100 km/h)
            const speed = (locationDistance / 1000) / (timeDiff / 3600000);
            if (speed > 100) {
              fraudScore += 50;
              reasons.push('Impossible travel distance detected');
            }
          }
        }

        // Check GPS accuracy indicators
        if (deviceInfo.location && deviceInfo.location.accuracy > 100) {
          fraudScore += 15;
          reasons.push('Low GPS accuracy detected');
        }
      }

      // 3. Time-based fraud detection
      const currentTime = new Date();
      const sessionStart = new Date(session.start_time);
      const sessionEnd = new Date(session.end_time);
      
      // Check if marking attendance too early or too late
      const timeToStart = sessionStart.getTime() - currentTime.getTime();
      const timeFromEnd = currentTime.getTime() - sessionEnd.getTime();
      
      if (timeToStart > 900000) { // More than 15 minutes early
        fraudScore += 25;
        reasons.push('Attendance marked too early');
      }
      
      if (timeFromEnd > 1800000) { // More than 30 minutes late
        fraudScore += 30;
        reasons.push('Attendance marked too late');
      }
    }

    // 4. Device fingerprint analysis
    if (deviceInfo) {
      // Check for suspicious device characteristics
      if (deviceInfo.userAgent && deviceInfo.userAgent.includes('HeadlessChrome')) {
        fraudScore += 40;
        reasons.push('Automated browser detected');
      }

      // Check for VPN indicators
      if (deviceInfo.timezone !== Intl.DateTimeFormat().resolvedOptions().timeZone) {
        fraudScore += 20;
        reasons.push('Timezone mismatch detected');
      }

      // Check scan timing
      if (deviceInfo.scanDuration < 500) {
        fraudScore += 15;
        reasons.push('Unusually fast QR scan');
      }
    }

    // 5. Check for duplicate device fingerprints
    const duplicateDevices = await checkDuplicateDevices(supabase, deviceInfo, userId);
    if (duplicateDevices > 0) {
      fraudScore += 25;
      reasons.push('Duplicate device fingerprint detected');
    }

    console.log(`Location check complete: fraud score ${fraudScore}`, reasons);

    return new Response(
      JSON.stringify({
        fraud_score: fraudScore,
        reasons: reasons,
        is_suspicious: fraudScore > 50,
        location_verified: fraudScore < 30
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Location check error:', error);
    return new Response(
      JSON.stringify({ error: 'Location verification failed', fraud_score: 100 }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleSecurityLog(
  supabase: any,
  eventType: string,
  userId: string,
  data: any,
  timestamp: string
) {
  try {
    // Log security events to a dedicated table (we'll create this)
    console.log(`Security event logged: ${eventType} for user ${userId}`, data);

    // For now, just return success - in production you'd store this in a security_logs table
    return new Response(
      JSON.stringify({ success: true, event_logged: eventType }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Security logging error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to log security event' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handlePatternAnalysis(supabase: any, userId: string) {
  try {
    // Analyze user attendance patterns for anomalies
    const patterns = await analyzeAttendancePatterns(supabase, userId);
    
    return new Response(
      JSON.stringify(patterns),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Pattern analysis failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

async function getRecentLocationHistory(supabase: any, userId: string) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('attendance')
    .select('location_lat, location_lng, marked_at')
    .eq('student_id', userId)
    .gte('marked_at', oneDayAgo.toISOString())
    .not('location_lat', 'is', null)
    .not('location_lng', 'is', null)
    .order('marked_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching location history:', error);
    return [];
  }

  return data || [];
}

async function checkDuplicateDevices(supabase: any, deviceInfo: any, userId: string) {
  if (!deviceInfo || !deviceInfo.canvasFingerprint) return 0;

  // This would require a device_fingerprints table to track device usage
  // For now, return 0 - in production you'd check for duplicate fingerprints
  return 0;
}

async function analyzeAttendancePatterns(supabase: any, userId: string) {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const { data: attendance, error } = await supabase
    .from('attendance')
    .select('marked_at, location_lat, location_lng, session_id')
    .eq('student_id', userId)
    .gte('marked_at', oneMonthAgo.toISOString())
    .order('marked_at', { ascending: false });

  if (error || !attendance) {
    return { patterns: [], risk_score: 0 };
  }

  const patterns = [];
  let riskScore = 0;

  // Analyze for unusual patterns
  if (attendance.length > 10) {
    // Check for attendance clustering (all attendance in short time periods)
    const timeGaps = [];
    for (let i = 1; i < attendance.length; i++) {
      const gap = new Date(attendance[i-1].marked_at).getTime() - new Date(attendance[i].marked_at).getTime();
      timeGaps.push(gap);
    }

    const avgGap = timeGaps.reduce((a, b) => a + b, 0) / timeGaps.length;
    if (avgGap < 300000) { // Average gap less than 5 minutes
      patterns.push('Suspicious attendance clustering detected');
      riskScore += 30;
    }
  }

  return {
    patterns,
    risk_score: riskScore,
    total_records: attendance.length
  };
}