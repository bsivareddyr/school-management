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
            <tr class="filter-row">
              <td><input type="text" [(ngModel)]="filterRoll" placeholder="Filter..." class="th-filter" /></td>
              <td><input type="text" [(ngModel)]="searchTerm" placeholder="Filter..." class="th-filter" /></td>
              <td>
                <select [(ngModel)]="filterClass" class="th-filter">
                  <option value="">All</option>
                  @for (cls of studentService.classes(); track cls) {
                    <option [value]="cls">{{ cls }}</option>
                  }
                </select>
              </td>
              <td>
                <select [(ngModel)]="filterSection" class="th-filter">
                  <option value="">All</option>
                  @for (sec of ['A','B','C','D']; track sec) {
                    <option [value]="sec">{{ sec }}</option>
                  }
                </select>
              </td>
              <td><input type="text" [(ngModel)]="filterParent" placeholder="Filter..." class="th-filter" /></td>
              <td></td>
              <td>
                <select [(ngModel)]="filterStatus" class="th-filter">
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </td>
              <td></td>
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
    .table-container {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      overflow: hidden;
      box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color);
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f8fafc;
      padding: 14px 16px;
      text-align: left;
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.7px;
      font-weight: 700;
      border: 1px solid var(--border-color);
    }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; color: var(--text-primary); }
    tbody tr:hover { background: #f8fafc; }
    .filter-row td {
      padding: 8px 10px;
      background: #f1f5f9;
      border: 1px solid var(--border-color);
    }
    .th-filter {
      width: 100%;
      padding: 6px 10px;
      border: 1.5px solid var(--input-border);
      border-radius: 6px;
      font-size: 13px;
      background: #fff;
      transition: var(--transition);
    }
    .th-filter:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1); }
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
  filterRoll = '';
  filterClass = '';
  filterSection = '';
  filterParent = '';
  filterStatus = '';

  readonly totalStudents = computed(() => this.studentService.students().length);
  readonly activeStudents = computed(() => this.studentService.students().filter(s => s.status === 'active').length);
  readonly inactiveStudents = computed(() => this.studentService.students().filter(s => s.status === 'inactive').length);

  readonly filteredStudents = computed(() => {
    let students = this.studentService.students();
    const search = this.searchTerm.toLowerCase();
    const roll = this.filterRoll.toLowerCase();
    const parent = this.filterParent.toLowerCase();

    if (search) {
      students = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search)
      );
    }
    if (roll) {
      students = students.filter(s => s.rollNumber.toLowerCase().includes(roll));
    }
    if (this.filterClass) {
      students = students.filter(s => s.class === this.filterClass);
    }
    if (this.filterSection) {
      students = students.filter(s => s.section === this.filterSection);
    }
    if (parent) {
      students = students.filter(s => s.parentName.toLowerCase().includes(parent));
    }
    if (this.filterStatus) {
      students = students.filter(s => s.status === this.filterStatus);
    }
    return students;
  });

  deleteStudent(id: number): void {
    if (confirm('Are you sure you want to delete this student?')) {
      this.studentService.deleteStudent(id);
    }
  }
}
