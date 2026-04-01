export interface Parent {
  id: string;
  name: string;
}

export interface ClassItem {
  id: string;
  name: string;
}

export interface Enrollment {
  id: string;
  class: ClassItem;
}

export interface Subscription {
  id: string;
  status: string;
  plan: string;
}

export interface Student {
  id: string;
  name: string;
  dateOfBirth: Date | string | null;
  notes: string | null;
  parentId: string;
  parent: Parent;
  enrollments: Enrollment[];
  subscriptions: Subscription[];
  createdAt: Date | string;
}

export interface StudentFormValues {
  name: string;
  dateOfBirth: string;
  parentId: string;
  notes: string;
}
