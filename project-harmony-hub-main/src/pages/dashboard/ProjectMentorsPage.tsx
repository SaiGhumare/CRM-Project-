import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DEPARTMENTS, ACADEMIC_YEARS } from '@/types';
import { Eye, Search, Download, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Backend types
interface MentorRecord {
  _id: string;
  name: string;
  email: string;
  department: string;
}

interface GroupRecord {
  _id: string;
  name: string;
  projectTitle: string;
  academicYear: string;
  members: { _id: string; name: string }[];
}

interface MentorWithGroups {
  mentor: MentorRecord;
  groups: GroupRecord[];
}

export default function ProjectMentorsPage() {
  const [academicYear, setAcademicYear] = useState('');
  const [department, setDepartment] = useState('');
  const [showMentors, setShowMentors] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const [mentorsWithGroups, setMentorsWithGroups] = useState<MentorWithGroups[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMentorsAndGroups = async () => {
    setLoading(true);
    try {
      // First fetch all mentors
      const mentorsData = await apiGet<{
        success: boolean;
        data: MentorRecord[];
      }>('/mentors');

      if (mentorsData.success) {
        // For each mentor, fetch their groups for this academic year
        const results: MentorWithGroups[] = [];
        for (const mentor of mentorsData.data) {
          const params = new URLSearchParams();
          if (academicYear) params.append('academicYear', academicYear);
          if (department) params.append('department', department);

          const groupsData = await apiGet<{
            success: boolean;
            data: GroupRecord[];
          }>(`/mentors/${mentor._id}/groups?${params.toString()}`);

          if (groupsData.success) {
            results.push({ mentor, groups: groupsData.data });
          }
        }
        // Only show mentors that have groups for this year
        setMentorsWithGroups(results.filter(r => r.groups.length > 0));
      }
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      toast({ title: 'Error', description: 'Failed to load mentors.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // fetch triggered directly by handleView
  }, []);

  const handleView = () => {
    if (academicYear && department) {
      setShowMentors(true);
      fetchMentorsAndGroups();
    }
  };

  const filteredMentors = mentorsWithGroups.filter(m =>
    m.mentor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Mentors Management</h1>
          <p className="text-muted-foreground">View project mentors/guides and their assigned student groups</p>
        </div>

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
                  <SelectTrigger><SelectValue placeholder="Select Year" /></SelectTrigger>
                  <SelectContent>{ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 min-w-[200px]">
                <Label>Department</Label>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map(d => <SelectItem key={d.value} value={d.value}>{d.label} ({d.value})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button className="btn-info" onClick={handleView}><Eye className="h-4 w-4 mr-2" />View Data</Button>
            </div>
          </CardContent>
        </Card>

        {showMentors && (
          loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Project Mentors - {academicYear}</CardTitle>
                    <CardDescription>{filteredMentors.length} mentors found with groups in {academicYear}</CardDescription>
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
                    <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMentors.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No mentors found with groups for this academic year.</p>
                ) : (
                  <div className="rounded-lg border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Name of Project Guide</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Allotted Groups</TableHead>
                          <TableHead>Projects</TableHead>
                          <TableHead>Total Groups</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMentors.map((item) => (
                          <TableRow key={item.mentor._id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{item.mentor.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{item.mentor.email}</TableCell>
                            <TableCell className="max-w-[200px]">
                              <div className="flex flex-wrap gap-1">
                                {item.groups.map((group) => (
                                  <Badge key={group._id} className="bg-info text-info-foreground">
                                    {group.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[250px]">
                              <div className="space-y-1">
                                {item.groups.map((group) => (
                                  <p key={group._id} className="text-xs text-muted-foreground truncate">
                                    <span className="font-medium">{group.name}:</span> {group.projectTitle}
                                  </p>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="flex items-center gap-1 w-fit">
                                <Users className="h-3 w-3" />
                                {item.groups.length}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        )}
      </div>
    </DashboardLayout>
  );
}
