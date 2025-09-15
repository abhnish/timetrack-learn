import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  TrendingUp,
  Download,
  Settings,
  AlertTriangle,
  School,
  Clock,
  MapPin
} from 'lucide-react';
import RealTimeAnalytics from '@/components/analytics/RealTimeAnalytics';
import SessionManager from '@/components/sessions/SessionManager';
import ActivityManager from '@/components/activities/ActivityManager';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-primary p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="opacity-90">System overview and analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/settings')} 
              className="text-white border-white hover:bg-white hover:text-primary"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={onLogout} className="text-white border-white hover:bg-white hover:text-primary">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <Tabs defaultValue="analytics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Real-Time Analytics</TabsTrigger>
            <TabsTrigger value="sessions">Session Management</TabsTrigger>
            <TabsTrigger value="activities">Activity Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-6">
            <RealTimeAnalytics />
          </TabsContent>
          
          <TabsContent value="sessions" className="space-y-6">
            <SessionManager userRole="admin" />
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-6">
            <ActivityManager userRole="admin" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}