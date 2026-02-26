import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  FileText, 
  FolderOpen, 
  Award, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Upload,
  Bell,
} from 'lucide-react';

const progressItems = [
  { title: 'Abstract Submission', status: 'completed', progress: 100 },
  { title: 'Synopsis', status: 'completed', progress: 100 },
  { title: 'Stage 1 Documents', status: 'in_progress', progress: 60 },
  { title: 'Stage 2 Documents', status: 'pending', progress: 0 },
  { title: 'ITR Documents', status: 'pending', progress: 0 },
  { title: 'Certificates', status: 'pending', progress: 0 },
];

const notifications = [
  { title: 'Abstract Approved', message: 'Your abstract "Smart Campus" has been approved!', type: 'success', time: '1 hour ago' },
  { title: 'Document Correction', message: 'Please revise your Synopsis and resubmit.', type: 'warning', time: '3 hours ago' },
  { title: 'Deadline Reminder', message: 'Stage 1 documents due in 5 days.', type: 'info', time: '1 day ago' },
];

const groupMembers = [
  { name: 'John Doe', rollNumber: '01', enrollmentNumber: '2021CO001' },
  { name: 'Jane Smith', rollNumber: '02', enrollmentNumber: '2021CO002' },
  { name: 'Bob Wilson', rollNumber: '03', enrollmentNumber: '2021CO003' },
];

export default function StudentDashboard() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-success" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-warning" />;
      default: return <Bell className="h-5 w-5 text-info" />;
    }
  };

  const overallProgress = Math.round(progressItems.reduce((acc, item) => acc + item.progress, 0) / progressItems.length);

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground">Track your project progress and submissions</p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Overall Progress</CardTitle>
            <CardDescription>Your project completion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completion</span>
                <span className="font-medium">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Submission Progress</CardTitle>
              <CardDescription>Track each submission stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressItems.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.title}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                  <div 
                    key={index} 
                    className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              My Group - G1
            </CardTitle>
            <CardDescription>Group members and project details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {groupMembers.map((member, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll: {member.rollNumber} | {member.enrollmentNumber}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Upload documents and manage submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button className="btn-success">
                <Upload className="h-4 w-4 mr-2" />
                Upload Abstract
              </Button>
              <Button className="btn-info">
                <FolderOpen className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
              <Button variant="outline">
                <Award className="h-4 w-4 mr-2" />
                Add Certificate
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
