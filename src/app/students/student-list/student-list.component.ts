import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../shared/services/student.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="student-list">
      <div class="page-header">
        <h1>Students</h1>
        @if (authService.hasRole('admin')) {
          <a routerLink="/students/new" class="btn-primary">+ Add Student</a>
        }
      </div>

      <div class="stats-grid">
        <div class="stat-card gradient-blue">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Total Students</span>
              <span class="stat-value">{{ totalStudents() }}</span>
              <span class="stat-change">All enrolled</span>
            </div>
            <div class="stat-icon-wrap">🎓</div>
          </div>
        </div>
        <div class="stat-card gradient-green">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Active</span>
              <span class="stat-value">{{ activeStudents() }}</span>
              <span class="stat-change positive">Currently enrolled</span>
            </div>
            <div class="stat-icon-wrap">✅</div>
          </div>
        </div>
        <div class="stat-card gradient-red">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Inactive</span>
              <span class="stat-value">{{ inactiveStudents() }}</span>
              <span class="stat-change negative">Not enrolled</span>
            </div>
            <div class="stat-icon-wrap">⚠️</div>
          </div>
        </div>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          <label>Name</label>
          <input type="text" [(ngModel)]="searchTerm" placeholder="Search name..." />
        </div>
        <div class="filter-group">
          <label>Class</label>
          <select [(ngModel)]="filterClass">
            <option value="">All Classes</option>
            @for (cls of studentService.classes(); track cls) {
              <option [value]="cls">{{ cls }}</option>
            }
          </select>
        </div>
        <div class="filter-group">
          <label>Section</label>
          <select [(ngModel)]="filterSection">
            <option value="">All Sections</option>
            @for (sec of ['A','B','C','D']; track sec) {
              <option [value]="sec">{{ sec }}</option>
            }
          </select>
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
              <th>Roll No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Section</th>
              <th>Parent</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (student of filteredStudents(); track student.id) {
              <tr>
                <td>{{ student.rollNumber }}</td>
                <td>
                  <a [routerLink]="['/students', student.id]" class="student-name">
                    {{ student.firstName }} {{ student.lastName }}
                  </a>
                </td>
                <td>{{ student.class }}</td>
                <td>{{ student.section }}</td>
                <td>{{ student.parentName }}</td>
                <td>{{ student.phone }}</td>
                <td>
                  <span class="status-badge" [class]="student.status">
                    {{ student.status }}
                  </span>
                </td>
                <td>
                  <div class="actions">
                    <a [routerLink]="['/students', student.id]" class="btn-icon" title="View">👁</a>
                    @if (authService.hasRole('admin')) {
                      <a [routerLink]="['/students', student.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
                      <button class="btn-icon delete" (click)="deleteStudent(student.id)" title="Delete">🗑</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="no-data">No students found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header h1 { margin: 0; color: var(--text-primary); font-weight: 800; letter-spacing: -0.5px; }
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
    .gradient-green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
    .gradient-red { background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; }
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
    .btn-primary {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      padding: 10px 22px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      transition: var(--transition);
      border: none;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
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
    .table-container {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      overflow: hidden;
      box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color);
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: linear-gradient(135deg, #4f46e5, #6366f1);
      padding: 14px 16px;
      text-align: left;
      font-size: 11px;
      color: #fff;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      font-weight: 700;
      border: 1px solid #4338ca;
    }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; color: var(--text-primary); }
    tbody tr:hover { background: #f8fafc; }
    .student-name { color: var(--primary); text-decoration: none; font-weight: 600; }
    .student-name:hover { text-decoration: underline; }
    .status-badge {
      padding: 4px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .status-badge.active { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive { background: var(--danger-bg); color: var(--danger); }
    .actions { display: flex; gap: 4px; }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 6px 8px;
      border-radius: 8px;
      text-decoration: none;
      transition: var(--transition);
    }
    .btn-icon:hover { background: #f1f5f9; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class StudentListComponent {
  readonly studentService = inject(StudentService);
  readonly authService = inject(AuthService);

  searchTerm = '';
  filterClass = '';
  filterSection = '';
  filterStatus = '';

  appliedSearch = '';
  appliedClass = '';
  appliedSection = '';
  appliedStatus = '';

  filterTrigger = signal(0);

  readonly totalStudents = computed(() => this.studentService.students().length);
  readonly activeStudents = computed(() => this.studentService.students().filter(s => s.status === 'active').length);
  readonly inactiveStudents = computed(() => this.studentService.students().filter(s => s.status === 'inactive').length);

  readonly filteredStudents = computed(() => {
    const trigger = this.filterTrigger();
    let students = this.studentService.students();
    if (this.appliedSearch) {
      const search = this.appliedSearch.toLowerCase();
      students = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search)
      );
    }
    if (this.appliedClass) {
      students = students.filter(s => s.class === this.appliedClass);
    }
    if (this.appliedSection) {
      students = students.filter(s => s.section === this.appliedSection);
    }
    if (this.appliedStatus) {
      students = students.filter(s => s.status === this.appliedStatus);
    }
    return students;
  });

  applyFilters(): void {
    this.appliedSearch = this.searchTerm;
    this.appliedClass = this.filterClass;
    this.appliedSection = this.filterSection;
    this.appliedStatus = this.filterStatus;
    this.filterTrigger.update(v => v + 1);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterClass = '';
    this.filterSection = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  deleteStudent(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id);
    }
  }
}
