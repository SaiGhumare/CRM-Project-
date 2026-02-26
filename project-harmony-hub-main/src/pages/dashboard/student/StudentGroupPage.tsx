import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const groupMembers = [
  { id: 1, name: 'Purva Santosh Deshmane', rollNumber: '01', enrollmentNumber: '23611780192', isLeader: true },
  { id: 2, name: 'Arpita Sanjay Galankar', rollNumber: '02', enrollmentNumber: '23611780234' },
  { id: 3, name: 'Rohit Vijay Patil', rollNumber: '03', enrollmentNumber: '23611780356' },
];

const projectDetails = {
  groupName: 'G1',
  groupNumber: 'G1',
  projectTitle: 'Smart Campus Management System',
  mentor: 'Prof. P. B. Datir',
  academicYear: '2025-26',
  department: 'Computer Engineering (CO)',
};

const progressItems = [
  { title: 'Abstract Submission', status: 'completed', progress: 100 },
  { title: 'Abstract Approval', status: 'completed', progress: 100 },
  { title: 'Synopsis', status: 'completed', progress: 100 },
  { title: 'Stage 1 PPT', status: 'completed', progress: 100 },
  { title: 'First Project Report', status: 'in_progress', progress: 60 },
  { title: 'Weekly Diary', status: 'in_progress', progress: 40 },
  { title: 'Stage 2 PPT', status: 'pending', progress: 0 },
  { title: 'Final Report', status: 'pending', progress: 0 },
  { title: 'Black Book', status: 'pending', progress: 0 },
  { title: 'Sponsorship Letter', status: 'pending', progress: 0 },
];

export default function StudentGroupPage() {
  const overallProgress = Math.round(progressItems.reduce((acc, item) => acc + item.progress, 0) / progressItems.length);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
                  {projectDetails.groupName}
                </CardTitle>
                <CardDescription>Group {projectDetails.groupNumber} | {projectDetails.academicYear}</CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground">{projectDetails.department}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-muted-foreground">Project Title</p>
                <p className="font-medium">{projectDetails.projectTitle}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Project Mentor</p>
                <p className="font-medium">{projectDetails.mentor}</p>
              </div>
            </div>

            {/* Group Members */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">MY GROUP</h3>
              <div className="space-y-3">
                {groupMembers.map((member, index) => (
                  <div 
                    key={member.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.name}</p>
                        {member.isLeader && (
                          <Badge variant="outline" className="text-xs">Leader</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Roll: {member.rollNumber} | Enrollment: {member.enrollmentNumber}
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

        {/* Detailed Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submission Progress</CardTitle>
            <CardDescription>Status of each project component</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {progressItems.map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      {getStatusBadge(item.status)}
                    </div>
                    <Progress value={item.progress} className="h-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
