import { Injectable, signal, computed } from '@angular/core';
import { Student } from '../models/student.model';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private studentsData = signal<Student[]>([
    { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@school.com', phone: '555-0101', dateOfBirth: '2010-03-15', gender: 'female', address: '123 Elm Street', class: '10', section: 'A', rollNumber: '1001', admissionDate: '2020-06-01', parentName: 'Robert Johnson', parentPhone: '555-0201', status: 'active' },
    { id: 2, firstName: 'Bob', lastName: 'Williams', email: 'bob@school.com', phone: '555-0102', dateOfBirth: '2010-07-22', gender: 'male', address: '456 Oak Avenue', class: '10', section: 'A', rollNumber: '1002', admissionDate: '2020-06-01', parentName: 'Mary Williams', parentPhone: '555-0202', status: 'active' },
    { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@school.com', phone: '555-0103', dateOfBirth: '2011-01-10', gender: 'male', address: '789 Pine Road', class: '9', section: 'B', rollNumber: '0901', admissionDate: '2021-06-01', parentName: 'James Brown', parentPhone: '555-0203', status: 'active' },
    { id: 4, firstName: 'Diana', lastName: 'Davis', email: 'diana@school.com', phone: '555-0104', dateOfBirth: '2011-05-18', gender: 'female', address: '321 Maple Lane', class: '9', section: 'A', rollNumber: '0902', admissionDate: '2021-06-01', parentName: 'Thomas Davis', parentPhone: '555-0204', status: 'active' },
    { id: 5, firstName: 'Edward', lastName: 'Miller', email: 'edward@school.com', phone: '555-0105', dateOfBirth: '2010-11-30', gender: 'male', address: '654 Birch Drive', class: '10', section: 'B', rollNumber: '1003', admissionDate: '2020-06-01', parentName: 'Susan Miller', parentPhone: '555-0205', status: 'active' },
    { id: 6, firstName: 'Fiona', lastName: 'Garcia', email: 'fiona@school.com', phone: '555-0106', dateOfBirth: '2012-02-14', gender: 'female', address: '987 Cedar Court', class: '8', section: 'A', rollNumber: '0801', admissionDate: '2022-06-01', parentName: 'Carlos Garcia', parentPhone: '555-0206', status: 'active' },
    { id: 7, firstName: 'George', lastName: 'Martinez', email: 'george@school.com', phone: '555-0107', dateOfBirth: '2010-09-05', gender: 'male', address: '147 Walnut Street', class: '10', section: 'A', rollNumber: '1004', admissionDate: '2020-06-01', parentName: 'Ana Martinez', parentPhone: '555-0207', status: 'inactive' },
    { id: 8, firstName: 'Hannah', lastName: 'Anderson', email: 'hannah@school.com', phone: '555-0108', dateOfBirth: '2011-08-20', gender: 'female', address: '258 Spruce Way', class: '9', section: 'A', rollNumber: '0903', admissionDate: '2021-06-01', parentName: 'Mark Anderson', parentPhone: '555-0208', status: 'active' },
  ]);

  readonly students = this.studentsData.asReadonly();

  readonly classes = computed(() => {
    const classSet = new Set(this.studentsData().map(s => s.class));
    return [...classSet].sort();
  });

  readonly sections = computed(() => {
    const sectionSet = new Set(this.studentsData().map(s => s.section));
    return [...sectionSet].sort();
  });

  getStudentById(id: number): Student | undefined {
    return this.studentsData().find(s => s.id === id);
  }

  getStudentsByClass(className: string, section?: string): Student[] {
    return this.studentsData().filter(s =>
      s.class === className && (!section || s.section === section) && s.status === 'active'
    );
  }

  addStudent(student: Omit<Student, 'id'>): void {
    const newId = Math.max(...this.studentsData().map(s => s.id), 0) + 1;
    this.studentsData.update(students => [...students, { ...student, id: newId }]);
  }

  updateStudent(id: number, updates: Partial<Student>): void {
    this.studentsData.update(students =>
      students.map(s => s.id === id ? { ...s, ...updates } : s)
    );
  }

  deleteStudent(id: number): void {
    this.studentsData.update(students => students.filter(s => s.id !== id));
  }
}
