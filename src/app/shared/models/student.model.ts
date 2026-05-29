export interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  parentName: string;
  parentPhone: string;
  status: 'active' | 'inactive';
}
