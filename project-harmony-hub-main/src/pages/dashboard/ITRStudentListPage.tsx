import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Upload, Search, Download, Plus, Save, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ITRStudent {
  id: string;
  serialNumber: string;
  enrollmentNumber: string;
  name: string;
  email: string;
  contactNumber: string;
  technologyInterested: string;
  companyName: string;
  companyAddress: string;
  hrOwnerName: string;
  trainerContact: string;
}

const mockITRStudents: Record<string, ITRStudent[]> = {
  '2023-24': [
    { id: '1', serialNumber: '1', enrollmentNumber: '22611780123', name: 'Rahul Sharma', email: 'rahul@email.com', contactNumber: '9876543210', technologyInterested: 'Java', companyName: 'TCS', companyAddress: 'TCS, Hinjewadi, Pune', hrOwnerName: 'Mr. Patil', trainerContact: '9876543290' },
    { id: '2', serialNumber: '2', enrollmentNumber: '22611780145', name: 'Priya Deshmukh', email: 'priya@email.com', contactNumber: '9876543211', technologyInterested: 'Python', companyName: 'Infosys', companyAddress: 'Infosys, Nashik', hrOwnerName: 'Mrs. Kulkarni', trainerContact: '9876543291' },
  ],
  '2024-25': [
    { id: '3', serialNumber: '1', enrollmentNumber: '23611780167', name: 'Amit Joshi', email: 'amit@email.com', contactNumber: '9876543212', technologyInterested: 'React', companyName: 'Wipro', companyAddress: 'Wipro, BKC, Mumbai', hrOwnerName: 'Mr. Shah', trainerContact: '9876543292' },
  ],
  '2025-26': [
    { id: '4', serialNumber: '1', enrollmentNumber: '23611780192', name: 'Purva Santosh Deshmane', email: 'purva@sandip.edu', contactNumber: '9876543213', technologyInterested: 'Node.js', companyName: 'Tech Mahindra', companyAddress: 'Tech Mahindra, Hinjewadi, Pune', hrOwnerName: 'Mr. Verma', trainerContact: '9876543293' },
    { id: '5', serialNumber: '2', enrollmentNumber: '23611780234', name: 'Arpita Sanjay Galankar', email: 'arpita@sandip.edu', contactNumber: '9876543214', technologyInterested: 'React', companyName: 'Persistent', companyAddress: 'Persistent, MIDC, Nashik', hrOwnerName: 'Mrs. Deshpande', trainerContact: '9876543294' },
    { id: '6', serialNumber: '3', enrollmentNumber: '23611780356', name: 'Sneha Patil', email: 'sneha@sandip.edu', contactNumber: '9876543215', technologyInterested: 'AWS', companyName: 'Accenture', companyAddress: 'Accenture, Magarpatta, Pune', hrOwnerName: 'Mr. Jain', trainerContact: '9876543295' },
  ],
};

interface ITRStudentListPageProps {
  role: 'admin' | 'mentor';
}

export default function ITRStudentListPage({ role }: ITRStudentListPageProps) {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [department, setDepartment] = useState('');
  const [showStudents, setShowStudents] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<ITRStudent>>({ enrollmentNumber: '23611780' });

  const currentYearStudents = mockITRStudents[academicYear] || [];
  const isCurrentYear = academicYear === '2025-26';

  const filteredStudents = currentYearStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.enrollmentNumber.includes(searchQuery)
  );

  const handleAddStudent = () => {
    console.log('Adding student:', newStudent);
    setIsAddDialogOpen(false);
    setNewStudent({ enrollmentNumber: '23611780' });
  };

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
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Upload File</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              {isCurrentYear && (
                <div className="flex justify-end">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-success"><Plus className="h-4 w-4 mr-2" />Add Student</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add ITR Student</DialogTitle>
                        <DialogDescription>Enter student's industrial training details</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Serial Number</Label>
                          <Input value={newStudent.serialNumber || ''} onChange={(e) => setNewStudent({...newStudent, serialNumber: e.target.value})} placeholder="1" />
                        </div>
                        <div className="space-y-2">
                          <Label>Enrollment Number</Label>
                          <Input value={newStudent.enrollmentNumber || ''} onChange={(e) => setNewStudent({...newStudent, enrollmentNumber: e.target.value})} placeholder="23611780XXX" />
                        </div>
                        <div className="space-y-2">
                          <Label>Name of Student</Label>
                          <Input value={newStudent.name || ''} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="Full name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" value={newStudent.email || ''} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} placeholder="student@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Number</Label>
                          <Input value={newStudent.contactNumber || ''} onChange={(e) => setNewStudent({...newStudent, contactNumber: e.target.value})} placeholder="9876543210" />
                        </div>
                        <div className="space-y-2">
                          <Label>Technology Interested In</Label>
                          <Input value={newStudent.technologyInterested || ''} onChange={(e) => setNewStudent({...newStudent, technologyInterested: e.target.value})} placeholder="e.g., React, Python" />
                        </div>
                        <div className="space-y-2">
                          <Label>Name of Company</Label>
                          <Input value={newStudent.companyName || ''} onChange={(e) => setNewStudent({...newStudent, companyName: e.target.value})} placeholder="Company name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Address of Company</Label>
                          <Input value={newStudent.companyAddress || ''} onChange={(e) => setNewStudent({...newStudent, companyAddress: e.target.value})} placeholder="Full address" />
                        </div>
                        <div className="space-y-2">
                          <Label>HR/Owner Name</Label>
                          <Input value={newStudent.hrOwnerName || ''} onChange={(e) => setNewStudent({...newStudent, hrOwnerName: e.target.value})} placeholder="Mr./Mrs. Name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Training Instructor Contact</Label>
                          <Input value={newStudent.trainerContact || ''} onChange={(e) => setNewStudent({...newStudent, trainerContact: e.target.value})} placeholder="9876543210" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button className="btn-success" onClick={handleAddStudent}><Save className="h-4 w-4 mr-2" />Save Student</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

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
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[50px]">S.No.</TableHead>
                          <TableHead>Enrollment No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Technology</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Company Address</TableHead>
                          <TableHead>HR/Owner</TableHead>
                          <TableHead>Trainer Contact</TableHead>
                          {isCurrentYear && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredStudents.map(student => (
                          <TableRow key={student.id} className="hover:bg-muted/30">
                            <TableCell>{student.serialNumber}</TableCell>
                            <TableCell className="font-mono">{student.enrollmentNumber}</TableCell>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.contactNumber}</TableCell>
                            <TableCell>{student.technologyInterested}</TableCell>
                            <TableCell>{student.companyName}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{student.companyAddress}</TableCell>
                            <TableCell>{student.hrOwnerName}</TableCell>
                            <TableCell>{student.trainerContact}</TableCell>
                            {isCurrentYear && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-info"><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
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
        )}
      </div>
    </DashboardLayout>
  );
}
