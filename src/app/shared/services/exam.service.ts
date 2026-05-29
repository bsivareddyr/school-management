import { Injectable, signal, computed } from '@angular/core';
import { Exam, ExamSchedule, ExamNotification, ExamQuestion, ExamSubmission, StudentAnswer } from '../models/exam.model';

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

  private questionsData = signal<ExamQuestion[]>([
    // Mathematics - Exam 1, Schedule 1
    { id: 1, scheduleId: 1, questionNumber: 1, questionText: 'What is the value of x in the equation 2x + 5 = 15?', type: 'mcq', options: ['3', '5', '7', '10'], correctAnswer: '5', marks: 5 },
    { id: 2, scheduleId: 1, questionNumber: 2, questionText: 'The derivative of x² is:', type: 'mcq', options: ['x', '2x', '2', 'x²'], correctAnswer: '2x', marks: 5 },
    { id: 3, scheduleId: 1, questionNumber: 3, questionText: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)', type: 'mcq', options: ['154 cm²', '44 cm²', '22 cm²', '308 cm²'], correctAnswer: '154 cm²', marks: 5 },
    { id: 4, scheduleId: 1, questionNumber: 4, questionText: 'Solve: If a triangle has angles 50° and 60°, what is the third angle?', type: 'short_answer', correctAnswer: '70', marks: 5 },
    { id: 5, scheduleId: 1, questionNumber: 5, questionText: 'What is the sum of first 10 natural numbers?', type: 'mcq', options: ['45', '55', '50', '100'], correctAnswer: '55', marks: 5 },
    // English - Exam 1, Schedule 2
    { id: 6, scheduleId: 2, questionNumber: 1, questionText: 'Which of the following is a synonym of "benevolent"?', type: 'mcq', options: ['Cruel', 'Kind', 'Angry', 'Lazy'], correctAnswer: 'Kind', marks: 5 },
    { id: 7, scheduleId: 2, questionNumber: 2, questionText: 'Identify the correct sentence:', type: 'mcq', options: ['He go to school daily.', 'He goes to school daily.', 'He going to school daily.', 'He gone to school daily.'], correctAnswer: 'He goes to school daily.', marks: 5 },
    { id: 8, scheduleId: 2, questionNumber: 3, questionText: 'What is the past tense of "write"?', type: 'short_answer', correctAnswer: 'wrote', marks: 5 },
    { id: 9, scheduleId: 2, questionNumber: 4, questionText: 'A "biography" is:', type: 'mcq', options: ['A fictional story', 'An account of someone\'s life written by another', 'A science document', 'A poem collection'], correctAnswer: 'An account of someone\'s life written by another', marks: 5 },
    { id: 10, scheduleId: 2, questionNumber: 5, questionText: 'Which figure of speech is used in "The wind howled in the night"?', type: 'mcq', options: ['Simile', 'Metaphor', 'Personification', 'Alliteration'], correctAnswer: 'Personification', marks: 5 },
    // Physics - Exam 1, Schedule 3
    { id: 11, scheduleId: 3, questionNumber: 1, questionText: 'What is the SI unit of force?', type: 'mcq', options: ['Watt', 'Newton', 'Joule', 'Pascal'], correctAnswer: 'Newton', marks: 5 },
    { id: 12, scheduleId: 3, questionNumber: 2, questionText: 'The speed of light in vacuum is approximately:', type: 'mcq', options: ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁴ m/s'], correctAnswer: '3 × 10⁸ m/s', marks: 5 },
    { id: 13, scheduleId: 3, questionNumber: 3, questionText: 'State Newton\'s second law of motion.', type: 'short_answer', correctAnswer: 'F = ma', marks: 5 },
    { id: 14, scheduleId: 3, questionNumber: 4, questionText: 'Which color of light has the shortest wavelength?', type: 'mcq', options: ['Red', 'Green', 'Blue', 'Violet'], correctAnswer: 'Violet', marks: 5 },
    { id: 15, scheduleId: 3, questionNumber: 5, questionText: 'What is the formula for kinetic energy?', type: 'mcq', options: ['mgh', '½mv²', 'mv', 'Fd'], correctAnswer: '½mv²', marks: 5 },
    // Chemistry - Exam 1, Schedule 4
    { id: 16, scheduleId: 4, questionNumber: 1, questionText: 'What is the chemical symbol for Gold?', type: 'mcq', options: ['Go', 'Gd', 'Au', 'Ag'], correctAnswer: 'Au', marks: 4 },
    { id: 17, scheduleId: 4, questionNumber: 2, questionText: 'The pH of pure water is:', type: 'mcq', options: ['0', '7', '14', '1'], correctAnswer: '7', marks: 4 },
    { id: 18, scheduleId: 4, questionNumber: 3, questionText: 'What is the atomic number of Carbon?', type: 'short_answer', correctAnswer: '6', marks: 4 },
    { id: 19, scheduleId: 4, questionNumber: 4, questionText: 'Which gas is known as laughing gas?', type: 'mcq', options: ['NO₂', 'N₂O', 'CO₂', 'SO₂'], correctAnswer: 'N₂O', marks: 4 },
    { id: 20, scheduleId: 4, questionNumber: 5, questionText: 'Rust is chemically known as:', type: 'mcq', options: ['Iron oxide', 'Iron sulfate', 'Iron chloride', 'Iron carbonate'], correctAnswer: 'Iron oxide', marks: 4 },
    // Computer Science - Exam 1, Schedule 5
    { id: 21, scheduleId: 5, questionNumber: 1, questionText: 'HTML stands for:', type: 'mcq', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Language', 'Home Tool Markup Language'], correctAnswer: 'Hyper Text Markup Language', marks: 4 },
    { id: 22, scheduleId: 5, questionNumber: 2, questionText: 'Which data structure uses FIFO?', type: 'mcq', options: ['Stack', 'Queue', 'Tree', 'Graph'], correctAnswer: 'Queue', marks: 4 },
    { id: 23, scheduleId: 5, questionNumber: 3, questionText: 'What does CPU stand for?', type: 'short_answer', correctAnswer: 'Central Processing Unit', marks: 4 },
    { id: 24, scheduleId: 5, questionNumber: 4, questionText: 'Binary number 1010 is equal to decimal:', type: 'mcq', options: ['8', '10', '12', '14'], correctAnswer: '10', marks: 4 },
    { id: 25, scheduleId: 5, questionNumber: 5, questionText: 'Which language is primarily used for styling web pages?', type: 'mcq', options: ['HTML', 'JavaScript', 'CSS', 'Python'], correctAnswer: 'CSS', marks: 4 },
  ]);

  private submissionsData = signal<ExamSubmission[]>([
    {
      id: 1, examId: 5, scheduleId: 8, studentId: 3, studentName: 'Alice Johnson',
      answers: [
        { questionId: 100, answer: '42', isCorrect: false, marksAwarded: 0 },
      ],
      totalMarks: 50, obtainedMarks: 38, submittedAt: '2026-04-01', status: 'graded',
    },
    {
      id: 2, examId: 5, scheduleId: 9, studentId: 3, studentName: 'Alice Johnson',
      answers: [
        { questionId: 101, answer: 'Photosynthesis', isCorrect: true, marksAwarded: 10 },
      ],
      totalMarks: 50, obtainedMarks: 42, submittedAt: '2026-04-02', status: 'graded',
    },
    {
      id: 3, examId: 5, scheduleId: 10, studentId: 3, studentName: 'Alice Johnson',
      answers: [
        { questionId: 102, answer: 'wrote', isCorrect: true, marksAwarded: 5 },
      ],
      totalMarks: 50, obtainedMarks: 35, submittedAt: '2026-04-03', status: 'graded',
    },
  ]);

  readonly exams = this.examsData.asReadonly();
  readonly schedules = this.schedulesData.asReadonly();
  readonly notifications = this.notificationsData.asReadonly();
  readonly questions = this.questionsData.asReadonly();
  readonly submissions = this.submissionsData.asReadonly();

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

  getQuestionsByScheduleId(scheduleId: number): ExamQuestion[] {
    return this.questionsData().filter(q => q.scheduleId === scheduleId).sort((a, b) => a.questionNumber - b.questionNumber);
  }

  addQuestion(question: Omit<ExamQuestion, 'id'>): void {
    const newId = Math.max(...this.questionsData().map(q => q.id), 0) + 1;
    this.questionsData.update(questions => [...questions, { ...question, id: newId }]);
  }

  updateQuestion(id: number, updates: Partial<ExamQuestion>): void {
    this.questionsData.update(questions => questions.map(q => q.id === id ? { ...q, ...updates } : q));
  }

  deleteQuestion(id: number): void {
    this.questionsData.update(questions => questions.filter(q => q.id !== id));
  }

  getSubmissionsByScheduleId(scheduleId: number): ExamSubmission[] {
    return this.submissionsData().filter(s => s.scheduleId === scheduleId);
  }

  getSubmissionByStudentAndSchedule(studentId: number, scheduleId: number): ExamSubmission | undefined {
    return this.submissionsData().find(s => s.studentId === studentId && s.scheduleId === scheduleId);
  }

  getSubmissionsByStudent(studentId: number): ExamSubmission[] {
    return this.submissionsData().filter(s => s.studentId === studentId);
  }

  submitExam(submission: Omit<ExamSubmission, 'id'>): ExamSubmission {
    const newId = Math.max(...this.submissionsData().map(s => s.id), 0) + 1;
    const newSubmission = { ...submission, id: newId };
    this.submissionsData.update(submissions => [...submissions, newSubmission]);
    return newSubmission;
  }

  gradeExam(questions: ExamQuestion[], answers: Map<number, string>): { studentAnswers: StudentAnswer[]; totalMarks: number; obtainedMarks: number } {
    const studentAnswers: StudentAnswer[] = [];
    let totalMarks = 0;
    let obtainedMarks = 0;

    for (const question of questions) {
      totalMarks += question.marks;
      const studentAnswer = answers.get(question.id) ?? '';
      const isCorrect = studentAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
      const marksAwarded = isCorrect ? question.marks : 0;
      obtainedMarks += marksAwarded;
      studentAnswers.push({ questionId: question.id, answer: studentAnswer, isCorrect, marksAwarded });
    }

    return { studentAnswers, totalMarks, obtainedMarks };
  }
}
