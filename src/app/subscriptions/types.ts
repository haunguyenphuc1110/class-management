export interface SessionEntry {
  id: string;
  date: string;
  classId: string | null;
}

export interface Parent {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  parent: Parent;
}

export interface Subscription {
  id: string;
  studentId: string;
  student: Student;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  totalSessions: number;
  notes: string | null;
  createdAt: string;
  sessions: SessionEntry[];
}

export interface SubscriptionFormValues {
  studentId: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount: string;
  totalSessions: string;
  notes: string;
}
