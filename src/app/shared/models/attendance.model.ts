export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  class: string;
  section: string;
  date: string;
  status: AttendanceStatus;
  remarks: string;
  markedBy: string;
}

export interface DailyAttendanceSummary {
  date: string;
  class: string;
  section: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}
