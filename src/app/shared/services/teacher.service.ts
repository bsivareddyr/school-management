import { Injectable, signal } from '@angular/core';
import { Teacher } from '../models/teacher.model';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private teachersData = signal<Teacher[]>([
    { id: 1, firstName: 'John', lastName: 'Smith', email: 'john@school.com', phone: '555-1001', dateOfBirth: '1985-04-12', gender: 'male', address: '100 Faculty Lane', qualification: 'M.Sc. Mathematics', specialization: 'Mathematics', experience: 12, joiningDate: '2013-08-01', salary: 55000, assignedClasses: ['10-A', '10-B'], subjects: ['Mathematics', 'Statistics'], status: 'active' },
    { id: 2, firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@school.com', phone: '555-1002', dateOfBirth: '1988-09-25', gender: 'female', address: '200 Faculty Lane', qualification: 'M.A. English Literature', specialization: 'English', experience: 9, joiningDate: '2016-07-15', salary: 48000, assignedClasses: ['9-A', '9-B', '10-A'], subjects: ['English', 'Literature'], status: 'active' },
    { id: 3, firstName: 'Michael', lastName: 'Chen', email: 'michael@school.com', phone: '555-1003', dateOfBirth: '1990-01-30', gender: 'male', address: '300 Faculty Lane', qualification: 'M.Sc. Physics', specialization: 'Physics', experience: 7, joiningDate: '2018-06-01', salary: 45000, assignedClasses: ['9-A', '10-A', '10-B'], subjects: ['Physics', 'General Science'], status: 'active' },
    { id: 4, firstName: 'Emily', lastName: 'Taylor', email: 'emily@school.com', phone: '555-1004', dateOfBirth: '1987-06-08', gender: 'female', address: '400 Faculty Lane', qualification: 'M.Sc. Chemistry', specialization: 'Chemistry', experience: 10, joiningDate: '2015-07-01', salary: 50000, assignedClasses: ['8-A', '9-B'], subjects: ['Chemistry', 'General Science'], status: 'active' },
    { id: 5, firstName: 'David', lastName: 'Brown', email: 'david@school.com', phone: '555-1005', dateOfBirth: '1982-12-15', gender: 'male', address: '500 Faculty Lane', qualification: 'M.A. History', specialization: 'History', experience: 15, joiningDate: '2010-08-01', salary: 58000, assignedClasses: ['8-A', '9-A', '10-A'], subjects: ['History', 'Social Studies'], status: 'active' },
    { id: 6, firstName: 'Lisa', lastName: 'Kumar', email: 'lisa@school.com', phone: '555-1006', dateOfBirth: '1992-03-20', gender: 'female', address: '600 Faculty Lane', qualification: 'M.Sc. Computer Science', specialization: 'Computer Science', experience: 5, joiningDate: '2020-07-01', salary: 42000, assignedClasses: ['9-A', '9-B', '10-A', '10-B'], subjects: ['Computer Science', 'ICT'], status: 'active' },
  ]);

  readonly teachers = this.teachersData.asReadonly();

  getTeacherById(id: number): Teacher | undefined {
    return this.teachersData().find(t => t.id === id);
  }

  addTeacher(teacher: Omit<Teacher, 'id'>): void {
    const newId = Math.max(...this.teachersData().map(t => t.id), 0) + 1;
    this.teachersData.update(teachers => [...teachers, { ...teacher, id: newId }]);
  }

  updateTeacher(id: number, updates: Partial<Teacher>): void {
    this.teachersData.update(teachers =>
      teachers.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  }

  deleteTeacher(id: number): void {
    this.teachersData.update(teachers => teachers.filter(t => t.id !== id));
  }
}
