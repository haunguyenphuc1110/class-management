export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  classes?: { id: string }[];
}

export interface Student {
  id: string;
  name: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student: Student;
  status: string;
}

export interface ClassItem {
  id: string;
  name: string;
  subject: string | null;
  teacherId: string;
  teacher: Teacher;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
  maxStudents: number;
  color: string | null;
  startDate: string | null;
  endDate: string | null;
  enrollments: Enrollment[];
}

export interface ClassFormValues {
  name: string;
  subject: string;
  teacherId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  maxStudents: string;
  color: string;
  startDate: string;
  endDate: string;
}

export interface TeacherFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
}

export interface AttendanceSubInfo {
  id: string;
  totalSessions: number;
  sessionsUsed: number;
}
