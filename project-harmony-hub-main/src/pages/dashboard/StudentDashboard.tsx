import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Upload,
  Bell,
  FolderOpen,
  Award,
} from 'lucide-react';
import { apiGet } from '@/lib/api';



export default function StudentDashboard() {
  const { user } = useAuth();
  const [groupData, setGroupData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch the student's group data
        if (user?.id) {
          const data = await apiGet<{ group?: any }>(`/groups/student/${user.id}`);
          if (data?.group) {
            setGroupData(data.group);
          }
        }
      } catch (error) {
        console.error('Failed to fetch group data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [user?.id]);


  const overallProgress = groupData?.overallProgress || 0;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user?.name}! 👋</h1>
          <p className="text-muted-foreground">
            Enrollment: {user?.enrollmentNumber || 'N/A'} | {user?.department || 'N/A'}
          </p>
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  Progress tracking is not fully implemented yet.
                </p>
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
                <p className="text-sm text-muted-foreground text-center py-4">
                  No new notifications.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              {groupData ? `My Group - ${groupData.name || 'Ungrouped'}` : 'My Group'}
            </CardTitle>
            <CardDescription>
              {groupData ? `${groupData.members?.length || 0} members | ${groupData.academicYear}` : 'Not assigned to a group yet'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupData && groupData.members && groupData.members.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groupData.members.map((member: any, index: number) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {(member.name || 'Unknown').charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{member.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.rollNumber ? `Roll: ${member.rollNumber}` : 'Roll: N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You have not been assigned to a group yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Your HOD will assign you to a group soon.</p>
              </div>
            )}
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
