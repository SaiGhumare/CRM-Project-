import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, CalendarCheck, CheckCircle } from 'lucide-react';

interface ITRDailyRecord {
  id: string;
  groupNumber: string;
  studentName: string;
  enrollmentNumber: string;
  technology: string;
  company: string;
  totalDays: number;
  presentDays: number;
  percentage: number;
  lastStatus: 'present' | 'absent';
}

const mockDailyRecords: ITRDailyRecord[] = [
  { id: '1', groupNumber: 'G1', studentName: 'Purva Santosh Deshmane', enrollmentNumber: '23611780192', technology: 'Node.js', company: 'Tech Mahindra', totalDays: 30, presentDays: 28, percentage: 93, lastStatus: 'present' },
  { id: '2', groupNumber: 'G1', studentName: 'Arpita Sanjay Galankar', enrollmentNumber: '23611780234', technology: 'React', company: 'Persistent', totalDays: 30, presentDays: 24, percentage: 80, lastStatus: 'present' },
  { id: '3', groupNumber: 'G2', studentName: 'Sneha Patil', enrollmentNumber: '23611780356', technology: 'AWS', company: 'Accenture', totalDays: 30, presentDays: 20, percentage: 67, lastStatus: 'absent' },
  { id: '4', groupNumber: 'G2', studentName: 'Rohan Gaikwad', enrollmentNumber: '23611780478', technology: 'Python', company: 'Infosys', totalDays: 30, presentDays: 25, percentage: 83, lastStatus: 'present' },
];

interface ITRDailyDetailsPageProps {
  role?: 'admin' | 'mentor';
}

export default function ITRDailyDetailsPage({ role = 'mentor' }: ITRDailyDetailsPageProps) {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [department, setDepartment] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Daily Details</h1>
          <p className="text-muted-foreground">View attendance status of students allotted to your groups</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => setShowDetails(true)}><Eye className="h-4 w-4 mr-2" />View</Button>
            </div>
          </CardContent>
        </Card>

        {showDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><CalendarCheck className="h-5 w-5" />Student Attendance Status</CardTitle>
              <CardDescription>Students with 75%+ are marked as completed. Visible to HOD, Project Guide, and ITR Coordinator.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Group</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Technology</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Total Days</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Attendance %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDailyRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell><Badge variant="outline">{record.groupNumber}</Badge></TableCell>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell className="font-mono">{record.enrollmentNumber}</TableCell>
                        <TableCell><Badge variant="secondary">{record.technology}</Badge></TableCell>
                        <TableCell>{record.company}</TableCell>
                        <TableCell>{record.totalDays}</TableCell>
                        <TableCell>{record.presentDays}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Progress value={record.percentage} className="h-2 flex-1" />
                            <span className={`text-sm font-medium ${record.percentage >= 75 ? 'text-success' : 'text-destructive'}`}>{record.percentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={record.lastStatus === 'present' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}>
                            {record.lastStatus === 'present' ? 'Present' : 'Absent'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.percentage >= 75 ? (
                            <Badge className="bg-success text-success-foreground"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
                          ) : (
                            <Badge variant="secondary">In Progress</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
