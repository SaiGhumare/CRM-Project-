import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarCheck, FolderOpen, Award } from 'lucide-react';

const stats = [
  { title: 'Assigned Students', value: '24', icon: Users, color: 'text-info' },
  { title: 'Attendance Marked', value: '18', icon: CalendarCheck, color: 'text-success' },
  { title: 'Documents Pending', value: '6', icon: FolderOpen, color: 'text-warning' },
  { title: 'Certificates Verified', value: '12', icon: Award, color: 'text-primary' },
];

export default function ITRCoordinatorDashboard() {
  return (
    <DashboardLayout role="itr_coordinator">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Coordinator Dashboard</h1>
          <p className="text-muted-foreground">Overview of ITR management - use sidebar to access detailed sections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Summary</CardTitle>
              <CardDescription>Navigate to ITR Details in the sidebar for full management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Total Students Assigned</span>
                  <span className="font-bold">24</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Attendance Above 75%</span>
                  <span className="font-bold text-success">18</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Pending Assignments</span>
                  <span className="font-bold text-warning">5</span>
                </div>
                <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                  <span className="text-sm">Fees Collected</span>
                  <span className="font-bold">80%</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Assignment submitted by Purva Deshmane</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Attendance marked for 20 Jan 2025</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Fee payment received from Arpita Galankar</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
