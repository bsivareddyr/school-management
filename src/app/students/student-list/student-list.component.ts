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

      <div class="filters">
        <input
          type="text"
          placeholder="Search by name..."
          [(ngModel)]="searchTerm"
          class="search-input"
        />
        <select [(ngModel)]="filterClass" class="filter-select">
          <option value="">All Classes</option>
          @for (cls of studentService.classes(); track cls) {
            <option [value]="cls">Class {{ cls }}</option>
          }
        </select>
        <select [(ngModel)]="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
    .filters { display: flex; gap: 12px; margin-bottom: 20px; }
    .search-input, .filter-select {
      padding: 10px 16px;
      border: 1.5px solid var(--input-border);
      border-radius: var(--input-radius);
      font-size: 14px;
      background: #f8fafc;
      transition: var(--transition);
    }
    .search-input { flex: 1; }
    .search-input:focus, .filter-select:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
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
    }
    td { padding: 14px 16px; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-primary); }
    tr:hover { background: #f8fafc; }
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
  filterStatus = '';

  readonly filteredStudents = computed(() => {
    let students = this.studentService.students();
    const search = this.searchTerm.toLowerCase();

    if (search) {
      students = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search) ||
        s.rollNumber.toLowerCase().includes(search)
      );
    }
    if (this.filterClass) {
      students = students.filter(s => s.class === this.filterClass);
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
