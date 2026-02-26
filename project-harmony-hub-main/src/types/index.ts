// User Roles
export type UserRole = 'admin' | 'mentor' | 'student' | 'itr_coordinator';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  enrollmentNumber?: string;
  rollNumber?: string;
  department?: Department;
  avatarUrl?: string;
}

// Departments
export type Department = 'CO' | 'IT' | 'EE' | 'CE' | 'ME';

export const DEPARTMENTS: { value: Department; label: string }[] = [
  { value: 'CO', label: 'Computer Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'EE', label: 'Electrical Engineering' },
  { value: 'CE', label: 'Civil Engineering' },
  { value: 'ME', label: 'Mechanical Engineering' },
];

// Academic Years
export const ACADEMIC_YEARS = [
  '2023-24',
  '2024-25',
  '2025-26',
  '2026-27',
];

// Student Group
export interface StudentGroup {
  id: string;
  name: string;
  members: Student[];
  academicYear: string;
  department: Department;
  mentorId?: string;
}

// Student
export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  rollNumber: string;
  department: Department;
  groupId?: string;
}

// Abstract Status
export type AbstractStatus = 'pending' | 'approved' | 'rejected';

// Abstract
export interface Abstract {
  id: string;
  title: string;
  description: string;
  fileUrl?: string;
  groupId: string;
  status: AbstractStatus;
  feedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Document Types
export type DocumentType = 
  | 'report'
  | 'synopsis'
  | 'ppt'
  | 'ppt_stage_one'
  | 'ppt_final'
  | 'black_book'
  | 'weekly_diary'
  | 'sponsorship_letter'
  | 'final_report'
  | 'first_project_report'
  | 'itr_report'
  | 'offer_letter';

export const DOCUMENT_TYPES: { value: DocumentType; label: string; category: 'project' | 'itr' }[] = [
  { value: 'synopsis', label: 'Synopsis', category: 'project' },
  { value: 'black_book', label: 'Black Book', category: 'project' },
  { value: 'ppt_final', label: 'PPT Final', category: 'project' },
  { value: 'ppt_stage_one', label: 'PPT Stage One', category: 'project' },
  { value: 'sponsorship_letter', label: 'Sponsorship Letter', category: 'project' },
  { value: 'final_report', label: 'Final Report', category: 'project' },
  { value: 'first_project_report', label: 'First Project Report', category: 'project' },
  { value: 'weekly_diary', label: 'Weekly Diary', category: 'project' },
  { value: 'itr_report', label: 'ITR Report', category: 'itr' },
  { value: 'offer_letter', label: 'Offer Letter', category: 'itr' },
];

// Document Status
export type DocumentStatus = 'not_submitted' | 'pending' | 'approved' | 'needs_correction' | 'verified' | 'verifying';

// Document
export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  groupId: string;
  stage: 1 | 2;
  status: DocumentStatus;
  feedback?: string;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// Certificate Types
export type CertificateType = 
  | 'itr_certificate'
  | 'published_paper'
  | 'project_competition'
  | 'udemy_course';

export const CERTIFICATE_TYPES: { value: CertificateType; label: string }[] = [
  { value: 'itr_certificate', label: 'ITR Completion Certificate' },
  { value: 'published_paper', label: 'Paper Published Certificate' },
  { value: 'project_competition', label: 'Project Competition Certificate' },
  { value: 'udemy_course', label: 'Udemy Certificate' },
];

// Certificate
export interface Certificate {
  id: string;
  type: CertificateType;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

// Seminar Stage
export type SeminarStage = 1 | 2;

export interface SeminarSubmission {
  id: string;
  groupId: string;
  stage: SeminarStage;
  documents: Document[];
  submittedAt: string;
  status: 'pending' | 'completed';
}

// Sample Document Types
export const SAMPLE_DOCUMENT_TYPES = [
  'Weekly Diary Format',
  'Synopsis',
  'PPT Stage One',
  'PPT Final',
  'Final Report',
  'Black Book',
  'Sponsorship Letter',
  'Paper Publish',
];
