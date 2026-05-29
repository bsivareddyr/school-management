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

      <div class="summary-cards">
        @for (summary of dailySummary(); track summary.class + summary.section) {
          <div class="summary-card">
            <h4>Class {{ summary.class }}-{{ summary.section }}</h4>
            <div class="summary-stats">
              <div class="stat present"><span class="num">{{ summary.present }}</span><span class="lbl">Present</span></div>
              <div class="stat absent"><span class="num">{{ summary.absent }}</span><span class="lbl">Absent</span></div>
              <div class="stat late"><span class="num">{{ summary.late }}</span><span class="lbl">Late</span></div>
              <div class="stat excused"><span class="num">{{ summary.excused }}</span><span class="lbl">Excused</span></div>
            </div>
          </div>
        }
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
            <tr class="filter-row">
              <td><input type="text" [(ngModel)]="filterName" placeholder="Filter..." class="th-filter" /></td>
              <td>
                <select [(ngModel)]="selectedClass" class="th-filter">
                  <option value="">All</option>
                  @for (cls of studentService.classes(); track cls) {
                    <option [value]="cls">{{ cls }}</option>
                  }
                </select>
              </td>
              <td>
                <select [(ngModel)]="selectedSection" class="th-filter">
                  <option value="">All</option>
                  @for (sec of studentService.sections(); track sec) {
                    <option [value]="sec">{{ sec }}</option>
                  }
                </select>
              </td>
              <td><input type="date" [(ngModel)]="selectedDate" class="th-filter" /></td>
              <td>
                <select [(ngModel)]="filterStatus" class="th-filter">
                  <option value="">All</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </td>
              <td></td>
              <td></td>
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
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 16px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    .summary-card h4 { margin: 0 0 12px; color: var(--primary); font-size: 14px; }
    .summary-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat { text-align: center; padding: 8px; border-radius: 10px; }
    .stat .num { display: block; font-size: 20px; font-weight: 700; }
    .stat .lbl { font-size: 11px; text-transform: uppercase; }
    .stat.present { background: var(--success-bg); color: var(--success-dark); }
    .stat.absent { background: var(--danger-bg); color: var(--danger); }
    .stat.late { background: var(--warning-bg); color: var(--accent-dark); }
    .stat.excused { background: var(--info-bg); color: var(--info); }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 14px 16px; text-align: left; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid var(--border-color); }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .filter-row td { padding: 8px 10px; background: #f1f5f9; border: 1px solid var(--border-color); }
    .th-filter { width: 100%; padding: 6px 10px; border: 1.5px solid var(--input-border); border-radius: 6px; font-size: 13px; background: #fff; transition: var(--transition); }
    .th-filter:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1); }
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

  readonly dailySummary = computed(() => {
    let summaries = this.attendanceService.getDailySummary(this.selectedDate);
    if (this.selectedClass) {
      summaries = summaries.filter(s => s.class === this.selectedClass);
    }
    if (this.selectedSection) {
      summaries = summaries.filter(s => s.section === this.selectedSection);
    }
    return summaries;
  });

  readonly filteredRecords = computed(() => {
    let records = this.attendanceService.getByDate(this.selectedDate);
    if (this.selectedClass) {
      records = records.filter(r => r.class === this.selectedClass);
    }
    if (this.selectedSection) {
      records = records.filter(r => r.section === this.selectedSection);
    }
    if (this.filterName) {
      const name = this.filterName.toLowerCase();
      records = records.filter(r => r.studentName.toLowerCase().includes(name));
    }
    if (this.filterStatus) {
      records = records.filter(r => r.status === this.filterStatus);
    }
    return records;
  });
}
