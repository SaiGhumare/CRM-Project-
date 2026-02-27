import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Upload, Search, Download, Loader2 } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend types
interface ITRStudentRecord {
  student: {
    _id: string;
    name: string;
    email: string;
    enrollmentNumber?: string;
    rollNumber?: string;
    department: string;
    academicYear?: string;
  };
  itrRecords: {
    _id: string;
    companyName: string;
    startDate: string;
    endDate: string;
    status: string;
  }[];
}

interface ITRStudentListPageProps {
  role: 'admin' | 'mentor';
}

export default function ITRStudentListPage({ role }: ITRStudentListPageProps) {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [students, setStudents] = useState<ITRStudentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchITRStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (academicYear) params.append('academicYear', academicYear);
      if (department) params.append('department', department);

      const data = await apiGet<{
        success: boolean;
        count: number;
        data: ITRStudentRecord[];
      }>(`/itr/students?${params.toString()}`);

      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch ITR students:', error);
      toast({ title: 'Error', description: 'Failed to load ITR student list.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showStudents) {
      fetchITRStudents();
    }
  }, [showStudents]);

  const filteredStudents = students.filter(s =>
    s.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.student.rollNumber || '').includes(searchQuery)
  );

  return (
    <DashboardLayout role={role}>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ITR Student List</h1>
          <p className="text-muted-foreground">Manage Industrial Training student records</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Filter Data</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={() => setShowStudents(true)}><Eye className="h-4 w-4 mr-2" />View Data</Button>
            </div>
          </CardContent>
        </Card>

        {showStudents && (
          loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="list" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="list">Student List</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">ITR Student List - {academicYear}</CardTitle>
                        <CardDescription>{filteredStudents.length} students found</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 w-[250px]" />
                        </div>
                        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {filteredStudents.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No ITR students found for this academic year.</p>
                    ) : (
                      <div className="rounded-lg border overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-[50px]">S.No.</TableHead>
                              <TableHead>Roll No.</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Company</TableHead>
                              <TableHead>Start Date</TableHead>
                              <TableHead>End Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredStudents.map((s, idx) => {
                              const latestRecord = s.itrRecords[0];
                              return (
                                <TableRow key={s.student._id} className="hover:bg-muted/30">
                                  <TableCell>{idx + 1}</TableCell>
                                  <TableCell className="font-mono">{s.student.rollNumber || '-'}</TableCell>
                                  <TableCell className="font-medium">{s.student.name}</TableCell>
                                  <TableCell>{s.student.email}</TableCell>
                                  <TableCell>{latestRecord?.companyName || '-'}</TableCell>
                                  <TableCell>{latestRecord?.startDate ? new Date(latestRecord.startDate).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell>{latestRecord?.endDate ? new Date(latestRecord.endDate).toLocaleDateString() : '-'}</TableCell>
                                  <TableCell>{latestRecord?.status || '-'}</TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upload ITR Student List</CardTitle>
                    <CardDescription>Upload Excel, Word, or PDF file with ITR student details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">Drag and drop your file here, or click to browse</p>
                        <Input type="file" accept=".xlsx,.xls,.csv,.pdf,.doc,.docx" className="max-w-xs mx-auto" />
                      </div>
                      <div className="flex gap-2">
                        <Button className="btn-success"><Upload className="h-4 w-4 mr-2" />Upload</Button>
                        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Download Template</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
