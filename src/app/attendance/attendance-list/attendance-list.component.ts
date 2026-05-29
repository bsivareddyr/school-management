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

      <div class="filters">
        <div class="form-group">
          <label>Date</label>
          <input type="date" [(ngModel)]="selectedDate" class="filter-input" />
        </div>
        <div class="form-group">
          <label>Class</label>
          <select [(ngModel)]="selectedClass" class="filter-select">
            <option value="">All Classes</option>
            @for (cls of studentService.classes(); track cls) {
              <option [value]="cls">Class {{ cls }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label>Section</label>
          <select [(ngModel)]="selectedSection" class="filter-select">
            <option value="">All Sections</option>
            @for (sec of studentService.sections(); track sec) {
              <option [value]="sec">{{ sec }}</option>
            }
          </select>
        </div>
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
    .page-header h1 { margin: 0; color: #1a237e; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .filters { display: flex; gap: 16px; margin-bottom: 16px; background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; }
    .filter-input, .filter-select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .filter-input:focus, .filter-select:focus { outline: none; border-color: #1a237e; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary-card { background: #fff; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .summary-card h4 { margin: 0 0 12px; color: #1a237e; font-size: 14px; }
    .summary-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .stat { text-align: center; padding: 8px; border-radius: 8px; }
    .stat .num { display: block; font-size: 20px; font-weight: 700; }
    .stat .lbl { font-size: 11px; text-transform: uppercase; }
    .stat.present { background: #e8f5e9; color: #2e7d32; }
    .stat.absent { background: #ffebee; color: #c62828; }
    .stat.late { background: #fff3e0; color: #e65100; }
    .stat.excused { background: #e3f2fd; color: #1565c0; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .student-name { font-weight: 500; color: #333; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.present { background: #e8f5e9; color: #2e7d32; }
    .status-badge.absent { background: #ffebee; color: #c62828; }
    .status-badge.late { background: #fff3e0; color: #e65100; }
    .status-badge.excused { background: #e3f2fd; color: #1565c0; }
    .no-data { text-align: center; color: #999; font-style: italic; padding: 40px !important; }
  `]
})
export class AttendanceListComponent {
  readonly attendanceService = inject(AttendanceService);
  readonly studentService = inject(StudentService);
  readonly authService = inject(AuthService);

  selectedDate = new Date().toISOString().split('T')[0];
  selectedClass = '';
  selectedSection = '';

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
    return records;
  });
}
