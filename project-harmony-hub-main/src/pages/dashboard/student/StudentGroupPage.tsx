import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface GroupMember {
  _id: string;
  name: string;
  rollNumber?: string;
  enrollmentNumber?: string;
}

interface GroupData {
  _id: string;
  name: string;
  projectTitle?: string;
  projectGuide?: string;
  academicYear: string;
  department: string;
  overallProgress: number;
  members: GroupMember[];
  mentorId?: {
    _id: string;
    name: string;
  };
}

export default function StudentGroupPage() {
  const { user } = useAuth();
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        if (user?.id) {
          const data = await apiGet<{ success: boolean; group: GroupData }>(`/groups/student/${user.id}`);
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

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading group data...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!groupData) {
    return (
      <DashboardLayout role="student">
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Group</h1>
            <p className="text-muted-foreground">View your group details and project progress</p>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You have not been assigned to a group yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Your HOD will assign you to a group soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const overallProgress = groupData.overallProgress || 0;

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Group</h1>
          <p className="text-muted-foreground">View your group details and project progress</p>
        </div>

        {/* Group Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {groupData.name}
                </CardTitle>
                <CardDescription>Group {groupData.name} | {groupData.academicYear}</CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground">{groupData.department}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Project Title</p>
                <p className="font-medium">{groupData.projectTitle || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project Mentor</p>
                <p className="font-medium">{groupData.projectGuide || groupData.mentorId?.name || 'Not assigned'}</p>
              </div>
            </div>

            {/* Group Members */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">MY GROUP</h3>
              <div className="space-y-3">
                {groupData.members.map((member, index) => (
                  <div 
                    key={member._id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Roll: {member.rollNumber || 'N/A'} | Enrollment: {member.enrollmentNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Project Completion Progress</CardTitle>
            <CardDescription>Track your overall project submission status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                <span className="text-sm text-muted-foreground">Overall Completion</span>
              </div>
              <Progress value={overallProgress} className="h-4" />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
