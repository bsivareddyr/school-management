import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeacherService } from '../../shared/services/teacher.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-teacher-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="teacher-list">
      <div class="page-header">
        <h1>Teachers</h1>
        <a routerLink="/teachers/new" class="btn-primary">+ Add Teacher</a>
      </div>

      <div class="stats-grid">
        <div class="stat-card gradient-blue">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Total Teachers</span>
              <span class="stat-value">{{ totalTeachers() }}</span>
              <span class="stat-change">All faculty</span>
            </div>
            <div class="stat-icon-wrap">👩‍🏫</div>
          </div>
        </div>
        @for (subj of subjectCounts(); track subj.subject; let i = $index) {
          <div class="stat-card" [class]="'gradient-' + subj.color">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">{{ subj.subject }}</span>
                <span class="stat-value">{{ subj.count }}</span>
                <span class="stat-change">{{ subj.count === 1 ? 'Teacher' : 'Teachers' }}</span>
              </div>
              <div class="stat-icon-wrap">{{ subj.icon }}</div>
            </div>
          </div>
        }
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label>Name</label>
          <input type="text" [(ngModel)]="searchTerm" placeholder="Search name..." />
        </div>
        <div class="filter-group">
          <label>Subject</label>
          <input type="text" [(ngModel)]="filterSubject" placeholder="Search subject..." />
        </div>
        <div class="filter-group">
          <label>Status</label>
          <select [(ngModel)]="filterStatus">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
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
              <th>Name</th>
              <th>Email</th>
              <th>Specialization</th>
              <th>Subjects</th>
              <th>Classes</th>
              <th>Experience</th>
              <th>Salary</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (teacher of filteredTeachers(); track teacher.id) {
              <tr>
                <td>
                  <a [routerLink]="['/teachers', teacher.id]" class="teacher-name">
                    {{ teacher.firstName }} {{ teacher.lastName }}
                  </a>
                </td>
                <td>{{ teacher.email }}</td>
                <td>{{ teacher.specialization }}</td>
                <td>{{ teacher.subjects.join(', ') }}</td>
                <td>{{ teacher.assignedClasses.join(', ') }}</td>
                <td>{{ teacher.experience }} yrs</td>
                <td>{{ teacher.salary | currency }}</td>
                <td><span class="status-badge" [class]="teacher.status">{{ teacher.status }}</span></td>
                <td>
                  <div class="actions">
                    <a [routerLink]="['/teachers', teacher.id]" class="btn-icon" title="View">👁</a>
                    <a [routerLink]="['/teachers', teacher.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
                    <button class="btn-icon delete" (click)="deleteTeacher(teacher.id)" title="Delete">🗑</button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="no-data">No teachers found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; color: var(--text-primary); font-weight: 800; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; transition: var(--transition); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
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
    .gradient-orange { background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; }
    .gradient-purple { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; }
    .gradient-teal { background: linear-gradient(135deg, #0891b2, #06b6d4); color: #fff; }
    .gradient-red { background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; }
    .gradient-pink { background: linear-gradient(135deg, #db2777, #ec4899); color: #fff; }
    .stat-card-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .stat-change { font-size: 12px; opacity: 0.7; font-weight: 500; }
    .stat-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
    }
    .filter-bar {
      display: flex; gap: 16px; align-items: flex-end; margin-bottom: 20px; padding: 20px;
      background: var(--card-bg); border-radius: var(--card-radius); box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color); flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-group select, .filter-group input {
      padding: 10px 14px; border: 1.5px solid var(--input-border); border-radius: 8px;
      font-size: 14px; background: #fff; transition: var(--transition); min-width: 160px;
    }
    .filter-group select:focus, .filter-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .btn-apply {
      padding: 10px 28px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: var(--transition);
    }
    .btn-apply:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-reset {
      padding: 10px 28px; background: #fff; color: var(--text-primary);
      border: 1.5px solid var(--input-border); border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition);
    }
    .btn-reset:hover { border-color: var(--primary); color: var(--primary); }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 14px 16px; text-align: left; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid #4338ca; }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .teacher-name { color: var(--primary); text-decoration: none; font-weight: 600; }
    .teacher-name:hover { text-decoration: underline; }
    .status-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.active { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive { background: var(--danger-bg); color: var(--danger); }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 6px 8px; border-radius: 8px; text-decoration: none; transition: var(--transition); }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class TeacherListComponent {
  private teacherService = inject(TeacherService);

  private readonly subjectIcons: Record<string, string> = {
    'Mathematics': '📊', 'Statistics': '📈', 'English': '📚', 'Literature': '📖',
    'Physics': '⚗️', 'Chemistry': '🧪', 'General Science': '🔬', 'History': '🏛️',
    'Social Studies': '🌍', 'Computer Science': '💻', 'ICT': '🖥️',
  };
  private readonly gradientColors = ['green', 'orange', 'purple', 'teal', 'red', 'pink', 'blue'];

  readonly totalTeachers = computed(() => this.teacherService.teachers().length);

  readonly subjectCounts = computed(() => {
    const teachers = this.teacherService.teachers();
    const subjectMap = new Map<string, number>();
    teachers.forEach(t => t.subjects.forEach(s => subjectMap.set(s, (subjectMap.get(s) || 0) + 1)));
    return Array.from(subjectMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry, i) => ({
        subject: entry[0],
        count: entry[1],
        icon: this.subjectIcons[entry[0]] || '📘',
        color: this.gradientColors[i % this.gradientColors.length],
      }));
  });

  searchTerm = '';
  filterSubject = '';
  filterStatus = '';

  appliedSearch = '';
  appliedSubject = '';
  appliedStatus = '';
  filterTrigger = signal(0);

  readonly filteredTeachers = computed(() => {
    const trigger = this.filterTrigger();
    let teachers = this.teacherService.teachers();
    if (this.appliedSearch) {
      const search = this.appliedSearch.toLowerCase();
      teachers = teachers.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(search)
      );
    }
    if (this.appliedSubject) {
      const sub = this.appliedSubject.toLowerCase();
      teachers = teachers.filter(t => t.subjects.some(s => s.toLowerCase().includes(sub)));
    }
    if (this.appliedStatus) {
      teachers = teachers.filter(t => t.status === this.appliedStatus);
    }
    return teachers;
  });

  applyFilters(): void {
    this.appliedSearch = this.searchTerm;
    this.appliedSubject = this.filterSubject;
    this.appliedStatus = this.filterStatus;
    this.filterTrigger.update(v => v + 1);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterSubject = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  deleteTeacher(id: number): void {
    if (confirm('Are you sure you want to delete this teacher?')) {
      this.teacherService.deleteTeacher(id);
    }
  }
}
