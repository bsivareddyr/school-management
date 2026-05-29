import { Injectable, signal, computed } from '@angular/core';
import { Exam, ExamSchedule, ExamNotification } from '../models/exam.model';

@Injectable({ providedIn: 'root' })
export class ExamService {
  private examsData = signal<Exam[]>([
    { id: 1, name: 'Mid-Term Examination 2026', type: 'midterm', class: '10', section: 'A', academicYear: '2025-2026', startDate: '2026-06-15', endDate: '2026-06-22', status: 'scheduled', createdBy: 'Admin User', createdAt: '2026-05-20' },
    { id: 2, name: 'Mid-Term Examination 2026', type: 'midterm', class: '10', section: 'B', academicYear: '2025-2026', startDate: '2026-06-15', endDate: '2026-06-22', status: 'scheduled', createdBy: 'Admin User', createdAt: '2026-05-20' },
    { id: 3, name: 'Unit Test 3', type: 'unit_test', class: '9', section: 'A', academicYear: '2025-2026', startDate: '2026-06-10', endDate: '2026-06-12', status: 'scheduled', createdBy: 'Admin User', createdAt: '2026-05-18' },
    { id: 4, name: 'Unit Test 3', type: 'unit_test', class: '9', section: 'B', academicYear: '2025-2026', startDate: '2026-06-10', endDate: '2026-06-12', status: 'scheduled', createdBy: 'Admin User', createdAt: '2026-05-18' },
    { id: 5, name: 'Quarterly Exam', type: 'quarterly', class: '8', section: 'A', academicYear: '2025-2026', startDate: '2026-04-01', endDate: '2026-04-07', status: 'completed', createdBy: 'Admin User', createdAt: '2026-03-15' },
  ]);

  private schedulesData = signal<ExamSchedule[]>([
    { id: 1, examId: 1, subject: 'Mathematics', date: '2026-06-15', startTime: '09:00', endTime: '12:00', room: 'Hall A', maxMarks: 100, passingMarks: 35 },
    { id: 2, examId: 1, subject: 'English', date: '2026-06-16', startTime: '09:00', endTime: '12:00', room: 'Hall A', maxMarks: 100, passingMarks: 35 },
    { id: 3, examId: 1, subject: 'Physics', date: '2026-06-17', startTime: '09:00', endTime: '12:00', room: 'Hall B', maxMarks: 100, passingMarks: 35 },
    { id: 4, examId: 1, subject: 'Chemistry', date: '2026-06-18', startTime: '09:00', endTime: '11:00', room: 'Hall B', maxMarks: 80, passingMarks: 28 },
    { id: 5, examId: 1, subject: 'Computer Science', date: '2026-06-19', startTime: '09:00', endTime: '11:00', room: 'Lab 1', maxMarks: 80, passingMarks: 28 },
    { id: 6, examId: 2, subject: 'Mathematics', date: '2026-06-15', startTime: '09:00', endTime: '12:00', room: 'Hall C', maxMarks: 100, passingMarks: 35 },
    { id: 7, examId: 2, subject: 'English', date: '2026-06-16', startTime: '09:00', endTime: '12:00', room: 'Hall C', maxMarks: 100, passingMarks: 35 },
    { id: 8, examId: 3, subject: 'Mathematics', date: '2026-06-10', startTime: '10:00', endTime: '11:30', room: 'Room 201', maxMarks: 50, passingMarks: 18 },
    { id: 9, examId: 3, subject: 'Science', date: '2026-06-11', startTime: '10:00', endTime: '11:30', room: 'Room 201', maxMarks: 50, passingMarks: 18 },
    { id: 10, examId: 3, subject: 'English', date: '2026-06-12', startTime: '10:00', endTime: '11:30', room: 'Room 201', maxMarks: 50, passingMarks: 18 },
  ]);

  private notificationsData = signal<ExamNotification[]>([
    { id: 1, examId: 1, message: 'Mid-Term Examination for Class 10-A starts on June 15, 2026. Please ensure your child is prepared.', sentTo: 'class_parents', targetClass: '10-A', sentAt: '2026-05-25', sentBy: 'Admin User', status: 'sent' },
    { id: 2, examId: 3, message: 'Unit Test 3 for Class 9-A is scheduled from June 10-12, 2026. Subjects: Mathematics, Science, English.', sentTo: 'class_parents', targetClass: '9-A', sentAt: '2026-05-28', sentBy: 'Admin User', status: 'sent' },
  ]);

  readonly exams = this.examsData.asReadonly();
  readonly schedules = this.schedulesData.asReadonly();
  readonly notifications = this.notificationsData.asReadonly();

  readonly totalExams = computed(() => this.examsData().length);
  readonly upcomingExams = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.examsData().filter(e => e.startDate >= today && e.status === 'scheduled');
  });
  readonly completedExams = computed(() => this.examsData().filter(e => e.status === 'completed'));

  getExamById(id: number): Exam | undefined {
    return this.examsData().find(e => e.id === id);
  }

  getSchedulesByExamId(examId: number): ExamSchedule[] {
    return this.schedulesData().filter(s => s.examId === examId);
  }

  getNotificationsByExamId(examId: number): ExamNotification[] {
    return this.notificationsData().filter(n => n.examId === examId);
  }

  getExamsByClass(className: string): Exam[] {
    return this.examsData().filter(e => e.class === className);
  }

  addExam(exam: Omit<Exam, 'id'>): number {
    const newId = Math.max(...this.examsData().map(e => e.id), 0) + 1;
    this.examsData.update(exams => [...exams, { ...exam, id: newId }]);
    return newId;
  }

  updateExam(id: number, updates: Partial<Exam>): void {
    this.examsData.update(exams => exams.map(e => e.id === id ? { ...e, ...updates } : e));
  }

  deleteExam(id: number): void {
    this.examsData.update(exams => exams.filter(e => e.id !== id));
    this.schedulesData.update(schedules => schedules.filter(s => s.examId !== id));
    this.notificationsData.update(notifications => notifications.filter(n => n.examId !== id));
  }

  addSchedule(schedule: Omit<ExamSchedule, 'id'>): void {
    const newId = Math.max(...this.schedulesData().map(s => s.id), 0) + 1;
    this.schedulesData.update(schedules => [...schedules, { ...schedule, id: newId }]);
  }

  updateSchedule(id: number, updates: Partial<ExamSchedule>): void {
    this.schedulesData.update(schedules => schedules.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  deleteSchedule(id: number): void {
    this.schedulesData.update(schedules => schedules.filter(s => s.id !== id));
  }

  sendNotification(notification: Omit<ExamNotification, 'id'>): void {
    const newId = Math.max(...this.notificationsData().map(n => n.id), 0) + 1;
    this.notificationsData.update(notifications => [...notifications, { ...notification, id: newId }]);
  }
}
