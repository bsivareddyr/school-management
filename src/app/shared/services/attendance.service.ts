import { Injectable, signal, computed } from '@angular/core';
import { AttendanceRecord, AttendanceStatus, DailyAttendanceSummary } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private attendanceData = signal<AttendanceRecord[]>([
    { id: 1, studentId: 1, studentName: 'Alice Johnson', class: '10', section: 'A', date: '2026-05-29', status: 'present', remarks: '', markedBy: 'John Smith' },
    { id: 2, studentId: 2, studentName: 'Bob Williams', class: '10', section: 'A', date: '2026-05-29', status: 'present', remarks: '', markedBy: 'John Smith' },
    { id: 3, studentId: 5, studentName: 'Edward Miller', class: '10', section: 'B', date: '2026-05-29', status: 'absent', remarks: 'Sick leave', markedBy: 'John Smith' },
    { id: 4, studentId: 7, studentName: 'George Martinez', class: '10', section: 'A', date: '2026-05-29', status: 'late', remarks: 'Arrived 15 min late', markedBy: 'John Smith' },
    { id: 5, studentId: 3, studentName: 'Charlie Brown', class: '9', section: 'B', date: '2026-05-29', status: 'present', remarks: '', markedBy: 'Sarah Wilson' },
    { id: 6, studentId: 4, studentName: 'Diana Davis', class: '9', section: 'A', date: '2026-05-29', status: 'present', remarks: '', markedBy: 'Sarah Wilson' },
    { id: 7, studentId: 8, studentName: 'Hannah Anderson', class: '9', section: 'A', date: '2026-05-29', status: 'excused', remarks: 'Doctor appointment', markedBy: 'Sarah Wilson' },
    { id: 8, studentId: 1, studentName: 'Alice Johnson', class: '10', section: 'A', date: '2026-05-28', status: 'present', remarks: '', markedBy: 'John Smith' },
    { id: 9, studentId: 2, studentName: 'Bob Williams', class: '10', section: 'A', date: '2026-05-28', status: 'absent', remarks: 'No information', markedBy: 'John Smith' },
    { id: 10, studentId: 5, studentName: 'Edward Miller', class: '10', section: 'B', date: '2026-05-28', status: 'present', remarks: '', markedBy: 'John Smith' },
    { id: 11, studentId: 3, studentName: 'Charlie Brown', class: '9', section: 'B', date: '2026-05-28', status: 'present', remarks: '', markedBy: 'Sarah Wilson' },
    { id: 12, studentId: 4, studentName: 'Diana Davis', class: '9', section: 'A', date: '2026-05-28', status: 'late', remarks: 'Bus delay', markedBy: 'Sarah Wilson' },
  ]);

  readonly attendance = this.attendanceData.asReadonly();

  getByDate(date: string): AttendanceRecord[] {
    return this.attendanceData().filter(a => a.date === date);
  }

  getByDateAndClass(date: string, className: string, section?: string): AttendanceRecord[] {
    return this.attendanceData().filter(a =>
      a.date === date && a.class === className && (!section || a.section === section)
    );
  }

  getByStudent(studentId: number): AttendanceRecord[] {
    return this.attendanceData().filter(a => a.studentId === studentId);
  }

  getDailySummary(date: string): DailyAttendanceSummary[] {
    const records = this.getByDate(date);
    const groups = new Map<string, AttendanceRecord[]>();

    for (const record of records) {
      const key = `${record.class}-${record.section}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    }

    const summaries: DailyAttendanceSummary[] = [];
    groups.forEach((classRecords, key) => {
      const [cls, sec] = key.split('-');
      summaries.push({
        date,
        class: cls,
        section: sec,
        totalStudents: classRecords.length,
        present: classRecords.filter(r => r.status === 'present').length,
        absent: classRecords.filter(r => r.status === 'absent').length,
        late: classRecords.filter(r => r.status === 'late').length,
        excused: classRecords.filter(r => r.status === 'excused').length,
      });
    });

    return summaries;
  }

  markAttendance(records: Omit<AttendanceRecord, 'id'>[]): void {
    const startId = Math.max(...this.attendanceData().map(a => a.id), 0) + 1;
    const newRecords = records.map((r, i) => ({ ...r, id: startId + i }));

    this.attendanceData.update(existing => {
      const filtered = existing.filter(e =>
        !newRecords.some(n => n.studentId === e.studentId && n.date === e.date)
      );
      return [...filtered, ...newRecords];
    });
  }

  updateAttendance(id: number, status: AttendanceStatus, remarks: string): void {
    this.attendanceData.update(records =>
      records.map(r => r.id === id ? { ...r, status, remarks } : r)
    );
  }
}
