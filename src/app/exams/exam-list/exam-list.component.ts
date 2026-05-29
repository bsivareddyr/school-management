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
        <div class="stat-card gradient-blue">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Total Exams</span>
              <span class="stat-value">{{ examService.totalExams() }}</span>
              <span class="stat-change">All examinations</span>
            </div>
            <div class="stat-icon-wrap">📝</div>
          </div>
        </div>
        <div class="stat-card gradient-orange">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Upcoming</span>
              <span class="stat-value">{{ examService.upcomingExams().length }}</span>
              <span class="stat-change">Scheduled exams</span>
            </div>
            <div class="stat-icon-wrap">📅</div>
          </div>
        </div>
        <div class="stat-card gradient-green">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Completed</span>
              <span class="stat-value">{{ examService.completedExams().length }}</span>
              <span class="stat-change positive">Finished exams</span>
            </div>
            <div class="stat-icon-wrap">✅</div>
          </div>
        </div>
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
            <tr class="filter-row">
              <td><input type="text" [(ngModel)]="nameFilter" placeholder="Filter..." class="th-filter" /></td>
              <td>
                <select [ngModel]="typeFilter()" (ngModelChange)="typeFilter.set($event)" class="th-filter">
                  <option value="">All</option>
                  <option value="midterm">Mid-Term</option>
                  <option value="final">Final</option>
                  <option value="unit_test">Unit Test</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="half_yearly">Half Yearly</option>
                </select>
              </td>
              <td>
                <select [ngModel]="classFilter()" (ngModelChange)="classFilter.set($event)" class="th-filter">
                  <option value="">All</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)" class="th-filter">
                  <option value="">All</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td></td>
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
    .page-header h1 { margin: 0; color: var(--primary); }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
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
    .gradient-orange { background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; }
    .gradient-green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
    .stat-card-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .stat-change { font-size: 12px; opacity: 0.7; font-weight: 500; }
    .stat-change.positive { opacity: 0.9; }
    .stat-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
    }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 14px 16px; text-align: left; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid #4338ca; }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .filter-row td { padding: 8px 10px; background: #f1f5f9; border: 1px solid var(--border-color); }
    .th-filter { width: 100%; padding: 6px 10px; border: 1.5px solid var(--input-border); border-radius: 6px; font-size: 13px; background: #fff; transition: var(--transition); }
    .th-filter:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1); }
    .exam-name { color: var(--primary); text-decoration: none; font-weight: 600; }
    .exam-name:hover { text-decoration: underline; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.scheduled { background: var(--info-bg); color: var(--info); }
    .status-badge.ongoing { background: var(--warning-bg); color: var(--accent-dark); }
    .status-badge.completed { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.cancelled { background: var(--danger-bg); color: var(--danger); }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class ExamListComponent {
  readonly authService = inject(AuthService);
  readonly examService = inject(ExamService);

  classFilter = signal('');
  statusFilter = signal('');
  typeFilter = signal('');
  nameFilter = '';

  readonly filteredExams = computed(() => {
    let exams = this.examService.exams();
    const classF = this.classFilter();
    const statusF = this.statusFilter();
    const typeF = this.typeFilter();
    if (classF) exams = exams.filter(e => e.class === classF);
    if (statusF) exams = exams.filter(e => e.status === statusF);
    if (typeF) exams = exams.filter(e => e.type === typeF);
    if (this.nameFilter) {
      const name = this.nameFilter.toLowerCase();
      exams = exams.filter(e => e.name.toLowerCase().includes(name));
    }
    return exams;
  });

  deleteExam(id: number): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examService.deleteExam(id);
    }
  }
}
