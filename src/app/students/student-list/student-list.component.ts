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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0; color: #1a237e; }
    .btn-primary {
      background: #1a237e;
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn-primary:hover { background: #283593; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input, .filter-select {
      padding: 8px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    .search-input { flex: 1; }
    .search-input:focus, .filter-select:focus { outline: none; border-color: #1a237e; }
    .table-container {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    table { width: 100%; border-collapse: collapse; }
    th {
      background: #f5f5f5;
      padding: 12px 16px;
      text-align: left;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .student-name { color: #1a237e; text-decoration: none; font-weight: 500; }
    .student-name:hover { text-decoration: underline; }
    .status-badge {
      padding: 4px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; }
    .status-badge.inactive { background: #ffebee; color: #c62828; }
    .actions { display: flex; gap: 4px; }
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px 6px;
      border-radius: 4px;
      text-decoration: none;
      transition: background 0.2s;
    }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: #ffebee; }
    .no-data { text-align: center; color: #999; font-style: italic; padding: 40px !important; }
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
