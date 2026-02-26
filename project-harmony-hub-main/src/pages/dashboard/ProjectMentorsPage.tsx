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
import { Eye, Upload, Search, Download, Plus, Save, Edit, Trash2, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface ProjectMentor {
  id: string;
  name: string;
  specialization: string;
  qualification: string;
  contactNumber: string;
  allotedGroups: string[];
  allotedGroupNumbers: string[];
  totalGroupsAssigned: number;
}

// Mock mentor data
const mockMentors: ProjectMentor[] = [
  { 
    id: '1', 
    name: 'Prof. P. B. Datir', 
    specialization: 'Machine Learning, Python', 
    qualification: 'M.Tech', 
    contactNumber: '9876543210', 
    allotedGroups: ['Purva Deshmane, Arpita Galankar, Rohit Patil'], 
    allotedGroupNumbers: ['G01'], 
    totalGroupsAssigned: 3 
  },
  { 
    id: '2', 
    name: 'Prof. S. K. Jadhav', 
    specialization: 'Web Development, React', 
    qualification: 'B.Tech', 
    contactNumber: '9876543211', 
    allotedGroups: ['Amit Joshi, Sneha Shah, Rahul More'], 
    allotedGroupNumbers: ['G02'], 
    totalGroupsAssigned: 4 
  },
  { 
    id: '3', 
    name: 'Prof. A. B. Kulkarni', 
    specialization: 'Database, SQL', 
    qualification: 'M.E.', 
    contactNumber: '9876543212', 
    allotedGroups: ['Priya Deshmukh, Varun Sawant'], 
    allotedGroupNumbers: ['G03'], 
    totalGroupsAssigned: 2 
  },
];

// Mock available groups
const mockGroups = [
  { id: 'g1', name: 'G01', members: 'Purva Deshmane, Arpita Galankar, Rohit Patil' },
  { id: 'g2', name: 'G02', members: 'Amit Joshi, Sneha Shah, Rahul More' },
  { id: 'g3', name: 'G03', members: 'Priya Deshmukh, Varun Sawant, Mayur Gaikwad' },
  { id: 'g4', name: 'G04', members: 'Anjali Kulkarni, Rohan Patil, Sakshi More' },
  { id: 'g5', name: 'G05', members: 'Vikram Singh, Neha Sharma, Akash Desai' },
];

export default function ProjectMentorsPage() {
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [department, setDepartment] = useState('');
  const [showMentors, setShowMentors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMentor, setNewMentor] = useState<Partial<ProjectMentor>>({});

  const isCurrentYear = academicYear === '2025-26';

  const filteredMentors = mockMentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleView = () => {
    if (academicYear && department) {
      setShowMentors(true);
    }
  };

  const handleAddMentor = () => {
    console.log('Adding mentor:', newMentor);
    setIsAddDialogOpen(false);
    setNewMentor({});
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Mentors Management</h1>
          <p className="text-muted-foreground">Assign project mentors/guides to student groups</p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Data</CardTitle>
            <CardDescription>Select academic year and department to view mentors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 min-w-[200px]">
                <Label>Academic Year (A.Y.)</Label>
                <Select value={academicYear} onValueChange={setAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label} ({dept.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="btn-info" onClick={handleView}>
                <Eye className="h-4 w-4 mr-2" />
                View Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {showMentors && (
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="upload">Excel Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4">
              {/* Add Mentor Button */}
              {isCurrentYear && (
                <div className="flex justify-end">
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="btn-success">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project Mentor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Project Mentor</DialogTitle>
                        <DialogDescription>Enter project mentor details and assign groups</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Name of Project Guide</Label>
                          <Input
                            value={newMentor.name || ''}
                            onChange={(e) => setNewMentor({...newMentor, name: e.target.value})}
                            placeholder="Prof. P. B. Datir"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Specialization</Label>
                          <Input
                            value={newMentor.specialization || ''}
                            onChange={(e) => setNewMentor({...newMentor, specialization: e.target.value})}
                            placeholder="e.g., Machine Learning, Web Development"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Qualification</Label>
                          <Select 
                            value={newMentor.qualification || ''} 
                            onValueChange={(value) => setNewMentor({...newMentor, qualification: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select qualification" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="B.Tech">B.Tech</SelectItem>
                              <SelectItem value="B.E.">B.E.</SelectItem>
                              <SelectItem value="M.Tech">M.Tech</SelectItem>
                              <SelectItem value="M.E.">M.E.</SelectItem>
                              <SelectItem value="Ph.D">Ph.D</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Contact Number</Label>
                          <Input
                            value={newMentor.contactNumber || ''}
                            onChange={(e) => setNewMentor({...newMentor, contactNumber: e.target.value})}
                            placeholder="9876543210"
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label>Allot to Group</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select group to assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {mockGroups.map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name} - {group.members}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button className="btn-success" onClick={handleAddMentor}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Mentor
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Mentor List Table */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Project Mentors - {academicYear}</CardTitle>
                      <CardDescription>{filteredMentors.length} mentors found</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search mentors..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 w-[250px]"
                        />
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Name of Project Guide</TableHead>
                          <TableHead>Qualification</TableHead>
                          <TableHead>Specialization</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Allotted Groups</TableHead>
                          <TableHead>Total Groups</TableHead>
                          {isCurrentYear && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMentors.map((mentor) => (
                          <TableRow key={mentor.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{mentor.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{mentor.qualification}</Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px]">{mentor.specialization}</TableCell>
                            <TableCell>{mentor.contactNumber}</TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="flex flex-wrap gap-1">
                                {mentor.allotedGroupNumbers.map((group, idx) => (
                                  <Badge key={idx} className="bg-info text-info-foreground">
                                    {group}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <Users className="h-3 w-3" />
                                {mentor.totalGroupsAssigned}
                              </Badge>
                            </TableCell>
                            {isCurrentYear && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-info">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
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
                  <CardTitle className="text-lg">Upload Project Mentors List</CardTitle>
                  <CardDescription>Upload an Excel spreadsheet with mentor details</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                      <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Drag and drop your Excel file here, or click to browse
                      </p>
                      <Input type="file" accept=".xlsx,.xls,.csv" className="max-w-xs mx-auto" />
                    </div>
                    <div className="flex gap-2">
                      <Button className="btn-success">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Required columns: Name of Project Guide, Qualification, Contact Number, 
                      Alloted to Group (Student Names), Alloted to Group Number, Total Groups Assigned
                    </p>
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
