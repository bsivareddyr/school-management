import { Component, inject, signal, computed } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AttendanceService } from '../../shared/services/attendance.service';
import { StudentService } from '../../shared/services/student.service';
import { AuthService } from '../../shared/services/auth.service';
import { AttendanceStatus } from '../../shared/models/attendance.model';

interface StudentAttendanceEntry {
  studentId: number;
  studentName: string;
  rollNumber: string;
  status: AttendanceStatus;
  remarks: string;
}

@Component({
  selector: 'app-attendance-mark',
  standalone: true,
  imports: [FormsModule, RouterLink, UpperCasePipe],
  template: `
    <div class="attendance-mark">
      <a routerLink="/attendance" class="back-link">← Back to Attendance</a>
      <h1>Mark Attendance</h1>

      <div class="filters-card">
        <div class="filters-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" [(ngModel)]="selectedDate" class="filter-input" />
          </div>
          <div class="form-group">
            <label>Class *</label>
            <select [(ngModel)]="selectedClass" class="filter-select" (ngModelChange)="loadStudents()">
              <option value="">Select Class</option>
              @for (cls of studentService.classes(); track cls) {
                <option [value]="cls">Class {{ cls }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Section *</label>
            <select [(ngModel)]="selectedSection" class="filter-select" (ngModelChange)="loadStudents()">
              <option value="">Select Section</option>
              @for (sec of studentService.sections(); track sec) {
                <option [value]="sec">{{ sec }}</option>
              }
            </select>
          </div>
          <button class="btn-load" (click)="loadStudents()">Load Students</button>
        </div>
      </div>

      @if (entries().length > 0) {
        <div class="quick-actions">
          <button class="btn-quick green" (click)="markAll('present')">All Present</button>
          <button class="btn-quick red" (click)="markAll('absent')">All Absent</button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              @for (entry of entries(); track entry.studentId; let i = $index) {
                <tr [class.absent-row]="entry.status === 'absent'">
                  <td>{{ entry.rollNumber }}</td>
                  <td class="student-name">{{ entry.studentName }}</td>
                  <td>
                    <div class="status-buttons">
                      @for (status of statuses; track status) {
                        <button
                          class="status-btn"
                          [class]="status"
                          [class.selected]="entry.status === status"
                          (click)="setStatus(i, status)"
                        >{{ status | uppercase }}</button>
                      }
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      [(ngModel)]="entry.remarks"
                      [ngModelOptions]="{ standalone: true }"
                      placeholder="Optional remarks"
                      class="remarks-input"
                    />
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="form-actions">
          <a routerLink="/attendance" class="btn-secondary">Cancel</a>
          <button class="btn-primary" (click)="saveAttendance()">Save Attendance</button>
        </div>
      }

      @if (successMessage()) {
        <div class="success-alert">{{ successMessage() }}</div>
      }
    </div>
  `,
  styles: [`
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    h1 { color: #1a237e; margin: 8px 0 20px; }
    .filters-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 16px; }
    .filters-row { display: flex; gap: 16px; align-items: flex-end; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; }
    .filter-input, .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .btn-load { background: #1a237e; color: #fff; border: none; padding: 9px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .quick-actions { display: flex; gap: 8px; margin-bottom: 12px; }
    .btn-quick { border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 13px; cursor: pointer; color: #fff; }
    .btn-quick.green { background: #2e7d32; }
    .btn-quick.red { background: #c62828; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; }
    .absent-row { background: #fff8f8; }
    .student-name { font-weight: 500; }
    .status-buttons { display: flex; gap: 4px; }
    .status-btn {
      padding: 4px 10px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 11px; font-weight: 600; cursor: pointer; background: #fff; transition: all 0.2s;
    }
    .status-btn.present.selected { background: #e8f5e9; color: #2e7d32; border-color: #2e7d32; }
    .status-btn.absent.selected { background: #ffebee; color: #c62828; border-color: #c62828; }
    .status-btn.late.selected { background: #fff3e0; color: #e65100; border-color: #e65100; }
    .status-btn.excused.selected { background: #e3f2fd; color: #1565c0; border-color: #1565c0; }
    .remarks-input { padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 13px; width: 200px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .btn-primary { background: #1a237e; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #f5f5f5; color: #333; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
    .success-alert { background: #e8f5e9; color: #2e7d32; padding: 12px 16px; border-radius: 8px; margin-top: 16px; font-weight: 500; border: 1px solid #a5d6a7; }
  `]
})
export class AttendanceMarkComponent {
  readonly studentService = inject(StudentService);
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private router = inject(Router);

  selectedDate = new Date().toISOString().split('T')[0];
  selectedClass = '';
  selectedSection = '';

  entries = signal<StudentAttendanceEntry[]>([]);
  successMessage = signal('');

  readonly statuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

  loadStudents(): void {
    if (!this.selectedClass || !this.selectedSection) return;

    const students = this.studentService.getStudentsByClass(this.selectedClass, this.selectedSection);
    const existingRecords = this.attendanceService.getByDateAndClass(this.selectedDate, this.selectedClass, this.selectedSection);

    this.entries.set(students.map(s => {
      const existing = existingRecords.find(r => r.studentId === s.id);
      return {
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        rollNumber: s.rollNumber,
        status: existing?.status ?? 'present',
        remarks: existing?.remarks ?? '',
      };
    }));
  }

  setStatus(index: number, status: AttendanceStatus): void {
    this.entries.update(entries => {
      const updated = [...entries];
      updated[index] = { ...updated[index], status };
      return updated;
    });
  }

  markAll(status: AttendanceStatus): void {
    this.entries.update(entries => entries.map(e => ({ ...e, status })));
  }

  saveAttendance(): void {
    const markedBy = this.authService.user()?.name ?? 'Unknown';
    const records = this.entries().map(e => ({
      studentId: e.studentId,
      studentName: e.studentName,
      class: this.selectedClass,
      section: this.selectedSection,
      date: this.selectedDate,
      status: e.status,
      remarks: e.remarks,
      markedBy,
    }));

    this.attendanceService.markAttendance(records);
    this.successMessage.set('Attendance saved successfully!');
    setTimeout(() => this.router.navigate(['/attendance']), 1500);
  }
}
