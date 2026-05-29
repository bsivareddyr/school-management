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

      <div class="filters">
        <input type="text" placeholder="Search by name or subject..." [(ngModel)]="searchTerm" class="search-input" />
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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0; color: var(--primary); }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .filters { margin-bottom: 16px; }
    .search-input { padding: 8px 14px; border: 1.5px solid var(--input-border); border-radius: 10px; font-size: 14px; width: 300px; }
    .search-input:focus { outline: none; border-color: var(--primary); }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 13px; color: var(--text-secondary); text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-size: 14px; }
    .teacher-name { color: var(--primary); text-decoration: none; font-weight: 600; }
    .teacher-name:hover { text-decoration: underline; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.active { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive { background: var(--danger-bg); color: var(--danger); }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class TeacherListComponent {
  private teacherService = inject(TeacherService);

  searchTerm = '';

  readonly filteredTeachers = computed(() => {
    let teachers = this.teacherService.teachers();
    const search = this.searchTerm.toLowerCase();
    if (search) {
      teachers = teachers.filter(t =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(search) ||
        t.specialization.toLowerCase().includes(search) ||
        t.subjects.some(s => s.toLowerCase().includes(search))
      );
    }
    return teachers;
  });

  deleteTeacher(id: number): void {
    if (confirm('Are you sure you want to delete this teacher?')) {
      this.teacherService.deleteTeacher(id);
    }
  }
}
