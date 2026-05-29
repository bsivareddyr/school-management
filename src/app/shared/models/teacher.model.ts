export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  qualification: string;
  specialization: string;
  experience: number;
  joiningDate: string;
  salary: number;
  assignedClasses: string[];
  subjects: string[];
  status: 'active' | 'inactive';
}
