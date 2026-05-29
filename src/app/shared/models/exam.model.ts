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

export interface ExamQuestion {
  id: number;
  scheduleId: number;
  questionNumber: number;
  questionText: string;
  type: 'mcq' | 'short_answer';
  options?: string[];
  correctAnswer: string;
  marks: number;
}

export interface ExamSubmission {
  id: number;
  examId: number;
  scheduleId: number;
  studentId: number;
  studentName: string;
  answers: StudentAnswer[];
  totalMarks: number;
  obtainedMarks: number;
  submittedAt: string;
  status: 'submitted' | 'graded';
}

export interface StudentAnswer {
  questionId: number;
  answer: string;
  isCorrect: boolean;
  marksAwarded: number;
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
