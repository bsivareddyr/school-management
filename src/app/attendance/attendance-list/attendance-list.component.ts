import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AttendanceService } from '../../shared/services/attendance.service';
import { StudentService } from '../../shared/services/student.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="attendance-list">
      <div class="page-header">
        <h1>Attendance</h1>
        @if (authService.hasRole('admin', 'teacher')) {
          <a routerLink="/attendance/mark" class="btn-primary">+ Mark Attendance</a>
        }
      </div>

      <div class="stats-grid">
        <div class="stat-card gradient-blue">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Total Records</span>
              <span class="stat-value">{{ totalRecords() }}</span>
              <span class="stat-change">Today's entries</span>
            </div>
            <div class="stat-icon-wrap">📋</div>
          </div>
        </div>
        <div class="stat-card gradient-green">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Present</span>
              <span class="stat-value">{{ totalPresent() }}</span>
              <span class="stat-change positive">Attended</span>
            </div>
            <div class="stat-icon-wrap">✅</div>
          </div>
        </div>
        <div class="stat-card gradient-red">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Absent</span>
              <span class="stat-value">{{ totalAbsent() }}</span>
              <span class="stat-change negative">Missing</span>
            </div>
            <div class="stat-icon-wrap">❌</div>
          </div>
        </div>
        <div class="stat-card gradient-orange">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Late</span>
              <span class="stat-value">{{ totalLate() }}</span>
              <span class="stat-change">Arrived late</span>
            </div>
            <div class="stat-icon-wrap">⏰</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label>Class</label>
          <select [(ngModel)]="selectedClass">
            <option value="">All Classes</option>
            @for (cls of studentService.classes(); track cls) {
              <option [value]="cls">{{ cls }}</option>
            }
          </select>
        </div>
        <div class="filter-group">
          <label>Section</label>
          <select [(ngModel)]="selectedSection">
            <option value="">All Sections</option>
            @for (sec of studentService.sections(); track sec) {
              <option [value]="sec">{{ sec }}</option>
            }
          </select>
        </div>
        <div class="filter-group">
          <label>Date</label>
          <input type="date" [(ngModel)]="selectedDate" />
        </div>
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="filterStatus">
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="excused">Excused</option>
          </select>
        </div>
        <div class="filter-group">
          <label>&nbsp;</label>
          <button class="btn-apply" (click)="applyFilters()">Apply</button>
        </div>
        <div class="filter-group">
          <label>&nbsp;</label>
          <button class="btn-reset" (click)="resetFilters()">Reset</button>
        </div>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Date</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Marked By</th>
            </tr>
          </thead>
          <tbody>
            @for (record of filteredRecords(); track record.id) {
              <tr>
                <td class="student-name">{{ record.studentName }}</td>
                <td>{{ record.class }}</td>
                <td>{{ record.section }}</td>
                <td>{{ record.date }}</td>
                <td>
                  <span class="status-badge" [class]="record.status">{{ record.status }}</span>
                </td>
                <td>{{ record.remarks || '-' }}</td>
                <td>{{ record.markedBy }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="7" class="no-data">No attendance records found for the selected filters</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0; color: var(--text-primary); font-weight: 800; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      border-radius: var(--card-radius);
      padding: 24px;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 100px; height: 100px;
      border-radius: 50%;
      background: #fff;
      opacity: 0.1;
      transform: translate(30%, -30%);
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
    .gradient-blue { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; }
    .gradient-green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
    .gradient-red { background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; }
    .gradient-orange { background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; }
    .stat-card-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .stat-change { font-size: 12px; opacity: 0.7; font-weight: 500; }
    .stat-change.positive { opacity: 0.9; }
    .stat-change.negative { opacity: 0.9; }
    .stat-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
    }
    .filter-bar {
      display: flex;
      gap: 16px;
      align-items: flex-end;
      margin-bottom: 20px;
      padding: 20px;
      background: var(--card-bg);
      border-radius: var(--card-radius);
      box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color);
      flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-group label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-group select,
    .filter-group input {
      padding: 10px 14px;
      border: 1.5px solid var(--input-border);
      border-radius: 8px;
      font-size: 14px;
      background: #fff;
      transition: var(--transition);
      min-width: 160px;
    }
    .filter-group select:focus,
    .filter-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }
    .btn-apply {
      padding: 10px 28px;
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-apply:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-reset {
      padding: 10px 28px;
      background: #fff;
      color: var(--text-primary);
      border: 1.5px solid var(--input-border);
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-reset:hover { border-color: var(--primary); color: var(--primary); }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 14px 16px; text-align: left; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid #4338ca; }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .student-name { font-weight: 600; color: var(--text-primary); }
    .status-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.present { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.absent { background: var(--danger-bg); color: var(--danger); }
    .status-badge.late { background: var(--warning-bg); color: var(--accent-dark); }
    .status-badge.excused { background: var(--info-bg); color: var(--info); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class AttendanceListComponent {
  readonly attendanceService = inject(AttendanceService);
  readonly studentService = inject(StudentService);
  readonly authService = inject(AuthService);

  selectedDate = new Date().toISOString().split('T')[0];
  selectedClass = '';
  selectedSection = '';
  filterName = '';
  filterStatus = '';

  appliedDate = this.selectedDate;
  appliedClass = '';
  appliedSection = '';
  appliedStatus = '';

  readonly filteredRecords = computed(() => {
    const trigger = this.filterTrigger();
    let records = this.attendanceService.getByDate(this.appliedDate);
    if (this.appliedClass) {
      records = records.filter(r => r.class === this.appliedClass);
    }
    if (this.appliedSection) {
      records = records.filter(r => r.section === this.appliedSection);
    }
    if (this.appliedStatus) {
      records = records.filter(r => r.status === this.appliedStatus);
    }
    return records;
  });

  readonly totalRecords = computed(() => this.filteredRecords().length);
  readonly totalPresent = computed(() => this.filteredRecords().filter(r => r.status === 'present').length);
  readonly totalAbsent = computed(() => this.filteredRecords().filter(r => r.status === 'absent').length);
  readonly totalLate = computed(() => this.filteredRecords().filter(r => r.status === 'late').length);

  filterTrigger = signal(0);

  applyFilters(): void {
    this.appliedDate = this.selectedDate;
    this.appliedClass = this.selectedClass;
    this.appliedSection = this.selectedSection;
    this.appliedStatus = this.filterStatus;
    this.filterTrigger.update(v => v + 1);
  }

  resetFilters(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.selectedClass = '';
    this.selectedSection = '';
    this.filterStatus = '';
    this.applyFilters();
  }
}
