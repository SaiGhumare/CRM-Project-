import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEPARTMENTS, ACADEMIC_YEARS, StudentGroup } from '@/types';
import { Eye, Users, Search, ArrowLeft, CheckCircle, Clock, AlertTriangle, FolderOpen, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GroupWithDetails extends StudentGroup {
  projectTitle: string;
  projectGuide: string;
  overallProgress: number;
  documentsSubmitted: string[];
  documentsPending: string[];
  certificatesSubmitted: string[];
  certificatesNotSubmitted: string[];
}

const mockGroups: GroupWithDetails[] = [
  { 
    id: '1', name: 'G1', projectTitle: 'Smart Campus Management System', projectGuide: 'Prof. P. B. Datir',
    overallProgress: 65,
    documentsSubmitted: ['Synopsis', 'PPT Stage One', 'Black Book'],
    documentsPending: ['Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'],
    certificatesSubmitted: ['Paper Presentation Certificate 1', 'Paper Presentation Certificate 2'],
    certificatesNotSubmitted: ['Paper Presentation Certificate 3', 'Project Competition Certificate'],
    members: [
      { id: '1', name: 'Purva Santosh Deshmane', email: 'purva@sandip.edu', enrollmentNumber: '23611780192', rollNumber: '01', department: 'CO' },
      { id: '2', name: 'Arpita Sanjay Galankar', email: 'arpita@sandip.edu', enrollmentNumber: '23611780234', rollNumber: '02', department: 'CO' },
    ],
    academicYear: '2025-26', department: 'CO',
  },
  { 
    id: '2', name: 'G2', projectTitle: 'AI-based Attendance System', projectGuide: 'Prof. S. K. Jadhav',
    overallProgress: 40,
    documentsSubmitted: ['Synopsis'],
    documentsPending: ['PPT Stage One', 'Black Book', 'Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'],
    certificatesSubmitted: ['Paper Presentation Certificate 1'],
    certificatesNotSubmitted: ['Paper Presentation Certificate 2', 'Paper Presentation Certificate 3', 'Project Competition Certificate'],
    members: [
      { id: '3', name: 'Sneha Patil', email: 'sneha@sandip.edu', enrollmentNumber: '23611780356', rollNumber: '03', department: 'CO' },
      { id: '4', name: 'Rohan Gaikwad', email: 'rohan@sandip.edu', enrollmentNumber: '23611780478', rollNumber: '04', department: 'CO' },
    ],
    academicYear: '2025-26', department: 'CO',
  },
  { 
    id: '3', name: 'G3', projectTitle: 'Predictive Analytics Dashboard', projectGuide: 'Prof. G. K. Ghate',
    overallProgress: 30,
    documentsSubmitted: ['Synopsis'],
    documentsPending: ['PPT Stage One', 'Black Book', 'Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'],
    certificatesSubmitted: [],
    certificatesNotSubmitted: ['Paper Presentation Certificate 1', 'Paper Presentation Certificate 2', 'Paper Presentation Certificate 3', 'Project Competition Certificate'],
    members: [
      { id: '5', name: 'Vikram Singh', email: 'vikram@sandip.edu', enrollmentNumber: '23611780590', rollNumber: '05', department: 'CO' },
      { id: '6', name: 'Neha Sharma', email: 'neha@sandip.edu', enrollmentNumber: '23611780612', rollNumber: '06', department: 'CO' },
      { id: '7', name: 'Akash Desai', email: 'akash@sandip.edu', enrollmentNumber: '23611780734', rollNumber: '07', department: 'CO' },
    ],
    academicYear: '2025-26', department: 'CO',
  },
  { 
    id: '4', name: 'G4', projectTitle: 'Voice-Controlled Home Automation', projectGuide: 'Prof. V. B. Ohol',
    overallProgress: 20,
    documentsSubmitted: [],
    documentsPending: ['Synopsis', 'PPT Stage One', 'Black Book', 'Final Report', 'PPT Final', 'Weekly Diary', 'Sponsorship Letter'],
    certificatesSubmitted: [],
    certificatesNotSubmitted: ['Paper Presentation Certificate 1', 'Paper Presentation Certificate 2', 'Paper Presentation Certificate 3', 'Project Competition Certificate'],
    members: [
      { id: '8', name: 'Sakshi More', email: 'sakshi@sandip.edu', enrollmentNumber: '23611780856', rollNumber: '08', department: 'CO' },
      { id: '9', name: 'Mayur Gaikwad', email: 'mayur@sandip.edu', enrollmentNumber: '23611780978', rollNumber: '09', department: 'CO' },
    ],
    academicYear: '2025-26', department: 'CO',
  },
];

interface GroupsPageProps {
  role: 'admin' | 'mentor';
}

export default function GroupsPage({ role }: GroupsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGroups, setShowGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithDetails | null>(null);

  const filteredGroups = mockGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.projectTitle.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <TableRow key={member.id}>
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

            {/* Documents Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FolderOpen className="h-5 w-5" />Documents Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-success flex items-center gap-1 mb-2"><CheckCircle className="h-4 w-4" />Submitted Documents ({selectedGroup.documentsSubmitted.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroup.documentsSubmitted.length > 0 ? selectedGroup.documentsSubmitted.map((doc, i) => (
                        <Badge key={i} className="bg-success text-success-foreground">{doc}</Badge>
                      )) : <span className="text-xs text-muted-foreground">None submitted yet</span>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warning flex items-center gap-1 mb-2"><Clock className="h-4 w-4" />Pending Documents ({selectedGroup.documentsPending.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGroup.documentsPending.map((doc, i) => (
                        <Badge key={i} variant="outline" className="text-warning border-warning">{doc}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5" />Certificates Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-success flex items-center gap-1 mb-2"><CheckCircle className="h-4 w-4" />Submitted Certificates ({selectedGroup.certificatesSubmitted.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.certificatesSubmitted.length > 0 ? selectedGroup.certificatesSubmitted.map((cert, i) => (
                      <Badge key={i} className="bg-success text-success-foreground">{cert}</Badge>
                    )) : <span className="text-xs text-muted-foreground">None submitted yet</span>}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-destructive flex items-center gap-1 mb-2"><AlertTriangle className="h-4 w-4" />Not Submitted ({selectedGroup.certificatesNotSubmitted.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedGroup.certificatesNotSubmitted.map((cert, i) => (
                      <Badge key={i} variant="outline" className="text-destructive border-destructive">{cert}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedGroup(group)}>
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
                            <div key={member.id} className="flex items-center justify-between text-sm p-2 rounded bg-muted/50">
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
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
