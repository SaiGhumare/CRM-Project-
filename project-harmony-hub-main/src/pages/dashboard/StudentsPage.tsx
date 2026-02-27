import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Search, Download, Plus, Save, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiGet } from '@/lib/api';

// Type for student data from the backend
interface StudentRecord {
  _id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  rollNumber: string;
  department: string;
  division: string;
  className: string;
  groupId?: {
    _id: string;
    name: string;
    projectGuide: string;
    mentorId?: {
      _id: string;
      name: string;
    };
  };
}

interface StudentsPageProps {
  role: 'admin' | 'mentor';
}

export default function StudentsPage({ role }: StudentsPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('roll_call');
  const [newStudent, setNewStudent] = useState({ name: '', className: '', department: '', groupNo: '', enrollmentNumber: '23611780', division: '', rollNumber: '' });
  const { toast } = useToast();

  // Real data states
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalStudents, setTotalStudents] = useState(0);

  // Fetch students from the backend
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (department) params.append('department', department);
      if (academicYear) params.append('academicYear', academicYear);
      if (searchQuery) params.append('search', searchQuery);
      params.append('limit', '100'); // Get all students

      const data = await apiGet<{
        success: boolean;
        count: number;
        total: number;
        data: StudentRecord[];
      }>(`/students?${params.toString()}`);

      if (data.success) {
        setStudents(data.data);
        setTotalStudents(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch students:', error);
      toast({ title: 'Error', description: 'Failed to load students.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch when view is clicked or search changes
  useEffect(() => {
    if (showStudents) {
      fetchStudents();
    }
  }, [showStudents, searchQuery]);

  const handleView = () => {
    if (academicYear && department) setShowStudents(true);
  };

  // Group students by mentor for "Assigned to Mentor" tab
  const studentsByMentor = students.reduce((acc, student) => {
    const mentorName = student.groupId?.projectGuide || 'Unassigned';
    if (!acc[mentorName]) acc[mentorName] = [];
    acc[mentorName].push(student);
    return acc;
  }, {} as Record<string, StudentRecord[]>);

  const handleAddStudent = () => {
    setIsAddDialogOpen(false);
    setNewStudent({ name: '', className: '', department: '', groupNo: '', enrollmentNumber: '23611780', division: '', rollNumber: '' });
    toast({ title: 'Student Added', description: 'Student has been added successfully.' });
  };

  const renderStudentTable = (studentList: StudentRecord[]) => (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[80px]">Roll No.</TableHead>
            <TableHead>Enrollment No.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Group No.</TableHead>
            <TableHead>Project Mentor</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            studentList.map((student) => (
              <TableRow key={student._id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{student.rollNumber}</TableCell>
                <TableCell className="font-mono">{student.enrollmentNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.division || '-'}</TableCell>
                <TableCell>{student.groupId?.name || '-'}</TableCell>
                <TableCell>{student.groupId?.projectGuide || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{student.email}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-info">View Details</Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students Management</h1>
          <p className="text-muted-foreground">View and manage student records</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Students</CardTitle>
            <CardDescription>Select academic year and department to view students</CardDescription>
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

        {showStudents && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Student List</CardTitle>
                  <CardDescription>{department} - Academic Year {academicYear} ({totalStudents} students)</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[250px]" />
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-success"><Plus className="h-4 w-4 mr-2" />Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Add Student</DialogTitle>
                        <DialogDescription>Enter student details manually</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="Full Name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Class</Label>
                          <Input value={newStudent.className} onChange={(e) => setNewStudent({...newStudent, className: e.target.value})} placeholder="e.g., TY Diploma" />
                        </div>
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={newStudent.department} onValueChange={(v) => setNewStudent({...newStudent, department: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Group No.</Label>
                          <Input value={newStudent.groupNo} onChange={(e) => setNewStudent({...newStudent, groupNo: e.target.value})} placeholder="e.g., G1" />
                        </div>
                        <div className="space-y-2">
                          <Label>Enrollment No.</Label>
                          <Input value={newStudent.enrollmentNumber} onChange={(e) => setNewStudent({...newStudent, enrollmentNumber: e.target.value})} placeholder="23611780XXX" />
                        </div>
                        <div className="space-y-2">
                          <Label>Division</Label>
                          <Select value={newStudent.division} onValueChange={(v) => setNewStudent({...newStudent, division: v})}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Roll No.</Label>
                          <Input value={newStudent.rollNumber} onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})} placeholder="01" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button className="btn-success" onClick={handleAddStudent}><Save className="h-4 w-4 mr-2" />Save Student</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading students...</span>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
                    <TabsTrigger value="roll_call">Roll Call List</TabsTrigger>
                    <TabsTrigger value="assigned_mentor">Students Assigned to Mentor</TabsTrigger>
                  </TabsList>

                  <TabsContent value="roll_call">
                    {renderStudentTable(students)}
                  </TabsContent>

                  <TabsContent value="assigned_mentor">
                    <div className="space-y-6">
                      {Object.entries(studentsByMentor).map(([mentorName, mentorStudents]) => (
                        <div key={mentorName}>
                          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            {mentorName} ({mentorStudents.length} students)
                          </h3>
                          {renderStudentTable(mentorStudents)}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
