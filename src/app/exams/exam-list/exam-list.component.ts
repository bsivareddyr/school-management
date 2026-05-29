import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="exam-list">
      <div class="page-header">
        <h1>Examinations</h1>
        @if (authService.hasRole('admin')) {
          <a routerLink="/exams/new" class="btn-primary">+ Create Exam</a>
        }
      </div>

      <div class="stats-grid">
        <div class="stat-card blue">
          <span class="stat-icon">📝</span>
          <div class="stat-info">
            <span class="stat-value">{{ examService.totalExams() }}</span>
            <span class="stat-label">Total Exams</span>
          </div>
        </div>
        <div class="stat-card orange">
          <span class="stat-icon">📅</span>
          <div class="stat-info">
            <span class="stat-value">{{ examService.upcomingExams().length }}</span>
            <span class="stat-label">Upcoming</span>
          </div>
        </div>
        <div class="stat-card green">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">{{ examService.completedExams().length }}</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>
      </div>

      <div class="filters">
        <select [(ngModel)]="classFilter" class="filter-select">
          <option value="">All Classes</option>
          <option value="8">Class 8</option>
          <option value="9">Class 9</option>
          <option value="10">Class 10</option>
        </select>
        <select [(ngModel)]="statusFilter" class="filter-select">
          <option value="">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select [(ngModel)]="typeFilter" class="filter-select">
          <option value="">All Types</option>
          <option value="midterm">Mid-Term</option>
          <option value="final">Final</option>
          <option value="unit_test">Unit Test</option>
          <option value="quarterly">Quarterly</option>
          <option value="half_yearly">Half Yearly</option>
        </select>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Exam Name</th>
              <th>Type</th>
              <th>Class</th>
              <th>Section</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (exam of filteredExams(); track exam.id) {
              <tr>
                <td>
                  <a [routerLink]="['/exams', exam.id]" class="exam-name">{{ exam.name }}</a>
                </td>
                <td class="capitalize">{{ exam.type.replace('_', ' ') }}</td>
                <td>{{ exam.class }}</td>
                <td>{{ exam.section }}</td>
                <td>{{ exam.startDate }}</td>
                <td>{{ exam.endDate }}</td>
                <td><span class="status-badge" [class]="exam.status">{{ exam.status }}</span></td>
                <td>
                  <div class="actions">
                    <a [routerLink]="['/exams', exam.id]" class="btn-icon" title="View Schedule">📅</a>
                    @if (authService.hasRole('admin')) {
                      <a [routerLink]="['/exams', exam.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
                      <a [routerLink]="['/exams', exam.id, 'notify']" class="btn-icon" title="Notify Parents">📧</a>
                      <button class="btn-icon delete" (click)="deleteExam(exam.id)" title="Delete">🗑</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="no-data">No exams found</td></tr>
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
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-card.blue { border-left: 4px solid #1565c0; }
    .stat-card.orange { border-left: 4px solid #e65100; }
    .stat-card.green { border-left: 4px solid #2e7d32; }
    .stat-icon { font-size: 32px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 700; color: #333; }
    .stat-label { font-size: 12px; color: #666; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
    .filter-select { padding: 8px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .filter-select:focus { outline: none; border-color: #1a237e; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .exam-name { color: #1a237e; text-decoration: none; font-weight: 500; }
    .exam-name:hover { text-decoration: underline; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.scheduled { background: #e3f2fd; color: #1565c0; }
    .status-badge.ongoing { background: #fff3e0; color: #e65100; }
    .status-badge.completed { background: #e8f5e9; color: #2e7d32; }
    .status-badge.cancelled { background: #ffebee; color: #c62828; }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: #ffebee; }
    .no-data { text-align: center; color: #999; font-style: italic; padding: 40px !important; }
  `]
})
export class ExamListComponent {
  readonly authService = inject(AuthService);
  readonly examService = inject(ExamService);

  classFilter = '';
  statusFilter = '';
  typeFilter = '';

  readonly filteredExams = computed(() => {
    let exams = this.examService.exams();
    if (this.classFilter) exams = exams.filter(e => e.class === this.classFilter);
    if (this.statusFilter) exams = exams.filter(e => e.status === this.statusFilter);
    if (this.typeFilter) exams = exams.filter(e => e.type === this.typeFilter);
    return exams;
  });

  deleteExam(id: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examService.deleteExam(id);
    }
  }
}
