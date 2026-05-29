export type Role = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: Role;
  email: string;
  linkedStudentId?: number;
  linkedTeacherId?: number;
}
