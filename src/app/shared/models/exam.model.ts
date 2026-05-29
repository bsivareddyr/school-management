export interface Exam {
  id: number;
  name: string;
  type: 'midterm' | 'final' | 'unit_test' | 'quarterly' | 'half_yearly';
  class: string;
  section: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface ExamSchedule {
  id: number;
  examId: number;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  maxMarks: number;
  passingMarks: number;
}

export interface ExamNotification {
  id: number;
  examId: number;
  message: string;
  sentTo: 'all_parents' | 'class_parents';
  targetClass: string;
  sentAt: string;
  sentBy: string;
  status: 'sent' | 'pending';
}
