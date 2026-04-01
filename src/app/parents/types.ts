export interface Student {
  id: string;
  name: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  students: Student[];
  createdAt: Date | string;
}

export interface ParentFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
}
