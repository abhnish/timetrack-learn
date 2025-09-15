import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  Settings,
  Plus,
  Eye
} from 'lucide-react';
import QRGenerator from '@/components/attendance/QRGenerator';
import SessionManager from '@/components/sessions/SessionManager';
import ActivityManager from '@/components/activities/ActivityManager';

interface FacultyDashboardProps {
  onLogout: () => void;
}

export default function FacultyDashboard({ onLogout }: FacultyDashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-card">
      {/* Header */}
      <div className="bg-gradient-success p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Faculty Dashboard</h1>
            <p className="opacity-90">Manage your classes and students</p>
          </div>
          <Button variant="outline" onClick={onLogout} className="text-white border-white hover:bg-white hover:text-success">
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <Tabs defaultValue="sessions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sessions">Session Management</TabsTrigger>
            <TabsTrigger value="activities">Activity Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sessions" className="space-y-6">
            <SessionManager userRole="faculty" />
          </TabsContent>
          
          <TabsContent value="activities" className="space-y-6">
            <ActivityManager userRole="faculty" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}