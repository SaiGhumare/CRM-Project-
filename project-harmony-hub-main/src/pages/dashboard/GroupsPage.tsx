import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Users, Search, ArrowLeft, CheckCircle, Clock, AlertTriangle, FolderOpen, Award, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend response types
interface GroupMember {
  _id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  rollNumber: string;
  department: string;
}

interface GroupRecord {
  _id: string;
  name: string;
  projectTitle: string;
  projectGuide: string;
  overallProgress: number;
  academicYear: string;
  department: string;
  mentorId?: {
    _id: string;
    name: string;
  };
  members: GroupMember[];
}

interface GroupsPageProps {
  role: 'admin' | 'mentor';
}

export default function GroupsPage({ role }: GroupsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupRecord | null>(null);
  const { toast } = useToast();

  // Real data states
  const [groups, setGroups] = useState<GroupRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch groups from backend
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);
      const data = await apiGet<{
        success: boolean;
        count: number;
        data: GroupRecord[];
      }>(`/groups?${params.toString()}`);

      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error);
      toast({ title: 'Error', description: 'Failed to load groups.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showGroups) {
      fetchGroups();
    }
  }, [showGroups]);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.projectTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = () => {
    if (academicYear && department) setShowGroups(true);
  };

  if (selectedGroup) {
    return (
      <DashboardLayout role={role}>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setSelectedGroup(null)}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Groups
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{selectedGroup.name} - Group Details</h1>
              <p className="text-muted-foreground">{selectedGroup.projectTitle}</p>
            </div>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Completion Progress</CardTitle>
              <CardDescription>Overall progress of {selectedGroup.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-bold text-lg">{selectedGroup.overallProgress}%</span>
                </div>
                <Progress value={selectedGroup.overallProgress} className="h-4" />
              </div>
            </CardContent>
          </Card>

          {/* Group Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5" />Group Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Name</TableHead>
                        <TableHead>Enrollment No.</TableHead>
                        <TableHead>Roll No.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedGroup.members.map((member) => (
                        <TableRow key={member._id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell className="font-mono">{member.enrollmentNumber}</TableCell>
                          <TableCell>{member.rollNumber}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 p-3 rounded-lg bg-muted/50">
                  <p className="text-sm"><span className="font-medium">Project Topic:</span> {selectedGroup.projectTitle}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Project Guide:</span> {selectedGroup.projectGuide}</p>
                </div>
              </CardContent>
            </Card>

            {/* Project Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />Project Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Academic Year</p>
                    <p className="text-sm text-muted-foreground">{selectedGroup.academicYear}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">{selectedGroup.department}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Guide / Mentor</p>
                    <p className="text-sm text-muted-foreground">{selectedGroup.projectGuide}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm font-medium">Members</p>
                    <p className="text-sm text-muted-foreground">{selectedGroup.members.length} students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Groups Management</h1>
          <p className="text-muted-foreground">View and manage student groups - click on a group to see details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Groups</CardTitle>
            <CardDescription>Select academic year and department to view groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map((year) => <SelectItem key={year} value={year}>{year}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((dept) => <SelectItem key={dept.value} value={dept.value}>{dept.label} ({dept.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={handleView}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showGroups && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Groups List</CardTitle>
                  <CardDescription>{department} - Academic Year {academicYear} ({filteredGroups.length} groups)</CardDescription>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search groups..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[250px]" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading groups...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredGroups.map((group) => (
                    <Card key={group._id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedGroup(group)}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {group.name}
                          </CardTitle>
                          <Badge variant="secondary">{group.members.length} members</Badge>
                        </div>
                        <CardDescription className="text-sm">{group.projectTitle}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="font-medium">{group.overallProgress}%</span>
                            </div>
                            <Progress value={group.overallProgress} className="h-2" />
                          </div>
                          <div className="space-y-1">
                            {group.members.map((member) => (
                              <div key={member._id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
                                <span>{member.name}</span>
                                <span className="text-xs text-muted-foreground">Roll: {member.rollNumber}</span>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Guide: {group.projectGuide}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
