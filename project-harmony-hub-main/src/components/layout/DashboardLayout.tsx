import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, FileText, Upload, Users, Award, Bell, LogOut,
  GraduationCap, ClipboardList, FolderOpen, Briefcase, UserCheck,
  FileStack, ChevronDown, ChevronRight, Megaphone, FileDown,
  ClipboardCheck, CalendarCheck, IndianRupee, UserPlus,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import sandipFoundationLogo from '@/assets/sandip-foundation-logo.jpeg';
import sandipPolytechnicLogo from '@/assets/sandip-polytechnic-logo.png';

interface DashboardLayoutProps {
  children: ReactNode;
  role: UserRole;
}

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
  badge?: number;
}

interface NavGroup {
  title: string;
  icon: ReactNode;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

const getNavEntries = (role: UserRole): NavEntry[] => {
  if (role === 'admin') {
    return [
      { title: 'Dashboard', href: '/dashboard/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
      { title: 'Create User', href: '/dashboard/admin/create-user', icon: <UserPlus className="h-5 w-5" /> },
      {
        title: 'Project Details',
        icon: <FolderOpen className="h-5 w-5" />,
        items: [
          { title: 'Student Management', href: '/dashboard/admin/students', icon: <Users className="h-5 w-5" /> },
          { title: 'Notice Delivering', href: '/dashboard/admin/notices', icon: <Megaphone className="h-5 w-5" /> },
          { title: 'Project Mentors', href: '/dashboard/admin/project-mentors', icon: <UserCheck className="h-5 w-5" /> },
          { title: 'Groups', href: '/dashboard/admin/groups', icon: <ClipboardList className="h-5 w-5" /> },
          { title: 'Abstracts', href: '/dashboard/admin/abstracts', icon: <FileText className="h-5 w-5" />, badge: 3 },
          { title: 'Sample Documents', href: '/dashboard/admin/sample-documents', icon: <FileDown className="h-5 w-5" /> },
          { title: 'Documents', href: '/dashboard/admin/documents', icon: <FolderOpen className="h-5 w-5" />, badge: 5 },
          { title: 'Certificates', href: '/dashboard/admin/certificates', icon: <Award className="h-5 w-5" /> },
        ],
      },
      {
        title: 'ITR Details',
        icon: <Briefcase className="h-5 w-5" />,
        items: [
          { title: 'ITR Student List', href: '/dashboard/admin/itr-students', icon: <Users className="h-5 w-5" /> },
          { title: 'ITR Coordinator', href: '/dashboard/admin/itr-coordinator', icon: <ClipboardCheck className="h-5 w-5" /> },
          { title: 'ITR Daily Details', href: '/dashboard/admin/itr-daily', icon: <CalendarCheck className="h-5 w-5" /> },
          { title: 'ITR Documents', href: '/dashboard/admin/itr-documents', icon: <FolderOpen className="h-5 w-5" /> },
          { title: 'ITR Certificates', href: '/dashboard/admin/itr-certificates', icon: <Award className="h-5 w-5" /> },
        ],
      },
    ];
  }

  if (role === 'mentor') {
    return [
      { title: 'Dashboard', href: '/dashboard/mentor', icon: <LayoutDashboard className="h-5 w-5" /> },
      {
        title: 'Project Details',
        icon: <FolderOpen className="h-5 w-5" />,
        items: [
          { title: 'Students', href: '/dashboard/mentor/students', icon: <Users className="h-5 w-5" /> },
          { title: 'Notice Delivering', href: '/dashboard/mentor/notices', icon: <Megaphone className="h-5 w-5" /> },
          { title: 'Groups', href: '/dashboard/mentor/groups', icon: <ClipboardList className="h-5 w-5" /> },
          { title: 'Abstracts', href: '/dashboard/mentor/abstracts', icon: <FileText className="h-5 w-5" />, badge: 3 },
          { title: 'Sample Documents', href: '/dashboard/mentor/sample-documents', icon: <FileDown className="h-5 w-5" /> },
          { title: 'Documents', href: '/dashboard/mentor/documents', icon: <FolderOpen className="h-5 w-5" />, badge: 5 },
          { title: 'Certificates', href: '/dashboard/mentor/certificates', icon: <Award className="h-5 w-5" /> },
          { title: 'Overall Documents', href: '/dashboard/mentor/overall-documents', icon: <FileStack className="h-5 w-5" /> },
        ],
      },
      {
        title: 'ITR Details',
        icon: <Briefcase className="h-5 w-5" />,
        items: [
          { title: 'ITR Student List', href: '/dashboard/mentor/itr-students', icon: <Users className="h-5 w-5" /> },
          { title: 'ITR Documents', href: '/dashboard/mentor/itr-documents', icon: <FolderOpen className="h-5 w-5" /> },
          { title: 'ITR Daily Details', href: '/dashboard/mentor/itr-daily', icon: <CalendarCheck className="h-5 w-5" /> },
          { title: 'ITR Certificates', href: '/dashboard/mentor/itr-certificates', icon: <Award className="h-5 w-5" /> },
        ],
      },
    ];
  }

  if (role === 'itr_coordinator') {
    return [
      { title: 'Dashboard', href: '/dashboard/itr_coordinator', icon: <LayoutDashboard className="h-5 w-5" /> },
      {
        title: 'ITR Details',
        icon: <Briefcase className="h-5 w-5" />,
        items: [
          { title: 'Student List', href: '/dashboard/itr_coordinator/students', icon: <Users className="h-5 w-5" /> },
          { title: 'Attendance', href: '/dashboard/itr_coordinator/attendance', icon: <CalendarCheck className="h-5 w-5" /> },
          { title: 'Notice Delivering', href: '/dashboard/itr_coordinator/notices', icon: <Megaphone className="h-5 w-5" /> },
          { title: 'Assignments', href: '/dashboard/itr_coordinator/assignments', icon: <FileText className="h-5 w-5" /> },
          { title: 'Documents', href: '/dashboard/itr_coordinator/documents', icon: <FolderOpen className="h-5 w-5" /> },
          { title: 'Certificates', href: '/dashboard/itr_coordinator/certificates', icon: <Award className="h-5 w-5" /> },
          { title: 'Fees Status', href: '/dashboard/itr_coordinator/fees', icon: <IndianRupee className="h-5 w-5" /> },
        ],
      },
    ];
  }

  // Student nav items
  return [
    { title: 'Dashboard', href: '/dashboard/student', icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: 'My Group', href: '/dashboard/student/group', icon: <Users className="h-5 w-5" /> },
    { title: 'Abstracts', href: '/dashboard/student/abstracts', icon: <FileText className="h-5 w-5" /> },
    { title: 'Documents', href: '/dashboard/student/documents', icon: <Upload className="h-5 w-5" /> },
    { title: 'Sample Documents', href: '/dashboard/student/sample-documents', icon: <FileDown className="h-5 w-5" /> },
    { title: 'ITR Section', href: '/dashboard/student/itr', icon: <Briefcase className="h-5 w-5" /> },
    { title: 'Certificates', href: '/dashboard/student/certificates', icon: <Award className="h-5 w-5" /> },
  ];
};

function CollapsibleNavGroup({ group, location }: { group: NavGroup; location: { pathname: string } }) {
  const isAnyActive = group.items.some(item => location.pathname === item.href);
  const [isOpen, setIsOpen] = useState(isAnyActive);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent ${isAnyActive ? 'text-sidebar-primary bg-sidebar-accent/50' : 'text-sidebar-foreground'}`}
      >
        {group.icon}
        <span className="flex-1 text-left">{group.title}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border pl-2">
          {group.items.map((item) => (
            <SidebarMenuItem key={item.href + item.title}>
              <SidebarMenuButton asChild isActive={location.pathname === item.href} className="w-full">
                <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                  {item.icon}
                  <span className="flex-1 text-sm">{item.title}</span>
                  {item.badge && <Badge variant="secondary" className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{item.badge}</Badge>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navEntries = getNavEntries(role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrator (HOD)';
      case 'mentor': return 'Project Mentor';
      case 'student': return 'Student';
      case 'itr_coordinator': return 'ITR Coordinator';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'bg-destructive text-destructive-foreground';
      case 'mentor': return 'bg-info text-info-foreground';
      case 'student': return 'bg-success text-success-foreground';
      case 'itr_coordinator': return 'bg-warning text-warning-foreground';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar className="border-r border-sidebar-border">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-sidebar-primary/20 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-sidebar-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sidebar-foreground truncate">PMS</h2>
                <p className="text-xs text-sidebar-foreground/70">Sandip Polytechnic</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {navEntries.map((entry, idx) => {
                if (isNavGroup(entry)) {
                  return <CollapsibleNavGroup key={idx} group={entry} location={location} />;
                }
                return (
                  <SidebarMenuItem key={entry.href}>
                    <SidebarMenuButton asChild isActive={location.pathname === entry.href} className="w-full">
                      <Link to={entry.href} className="flex items-center gap-3 px-3 py-2">
                        {entry.icon}
                        <span className="flex-1">{entry.title}</span>
                        {entry.badge && <Badge variant="secondary" className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">{entry.badge}</Badge>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-foreground">{user?.name?.charAt(0) || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name || 'User'}</p>
                <Badge className={`text-xs ${getRoleBadgeColor(role)}`}>{getRoleLabel(role)}</Badge>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />Sign Out
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-card border-b border-border px-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Welcome,</span>
                <span className="font-medium">{user?.name || 'User'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center">3</span>
              </Button>
              <div className="hidden md:flex items-center gap-4">
                <img src={sandipFoundationLogo} alt="Sandip Foundation" className="h-10 w-auto object-contain" />
                <img src={sandipPolytechnicLogo} alt="Sandip Polytechnic" className="h-10 w-10 object-contain" />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
