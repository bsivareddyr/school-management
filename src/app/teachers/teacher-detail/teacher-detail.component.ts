import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TeacherService } from '../../shared/services/teacher.service';

@Component({
  selector: 'app-teacher-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="teacher-detail">
      @if (teacher(); as t) {
        <div class="page-header">
          <div>
            <a routerLink="/teachers" class="back-link">← Back to Teachers</a>
            <h1>{{ t.firstName }} {{ t.lastName }}</h1>
          </div>
          <a [routerLink]="['/teachers', t.id, 'edit']" class="btn-primary">Edit Teacher</a>
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <h3>Personal Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Email</span><span class="value">{{ t.email }}</span></div>
              <div class="info-item"><span class="label">Phone</span><span class="value">{{ t.phone }}</span></div>
              <div class="info-item"><span class="label">Date of Birth</span><span class="value">{{ t.dateOfBirth }}</span></div>
              <div class="info-item"><span class="label">Gender</span><span class="value capitalize">{{ t.gender }}</span></div>
              <div class="info-item"><span class="label">Address</span><span class="value">{{ t.address }}</span></div>
              <div class="info-item"><span class="label">Status</span><span class="value"><span class="status-badge" [class]="t.status">{{ t.status }}</span></span></div>
            </div>
          </div>

          <div class="detail-card">
            <h3>Professional Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Qualification</span><span class="value">{{ t.qualification }}</span></div>
              <div class="info-item"><span class="label">Specialization</span><span class="value">{{ t.specialization }}</span></div>
              <div class="info-item"><span class="label">Experience</span><span class="value">{{ t.experience }} years</span></div>
              <div class="info-item"><span class="label">Joining Date</span><span class="value">{{ t.joiningDate }}</span></div>
              <div class="info-item"><span class="label">Salary</span><span class="value">{{ t.salary | currency }}</span></div>
              <div class="info-item"><span class="label">Subjects</span><span class="value">{{ t.subjects.join(', ') }}</span></div>
              <div class="info-item"><span class="label">Assigned Classes</span><span class="value">{{ t.assignedClasses.join(', ') }}</span></div>
            </div>
          </div>
        </div>
      } @else {
        <p>Teacher not found.</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { margin: 8px 0 0; color: #1a237e; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; }
    .detail-card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .detail-card h3 { margin: 0 0 16px; color: #1a237e; font-size: 16px; }
    .info-grid { display: flex; flex-direction: column; gap: 10px; }
    .info-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5; }
    .label { color: #666; font-size: 14px; }
    .value { font-weight: 500; font-size: 14px; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; }
    .status-badge.inactive { background: #ffebee; color: #c62828; }
  `]
})
export class TeacherDetailComponent {
  private route = inject(ActivatedRoute);
  private teacherService = inject(TeacherService);

  private readonly teacherId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  readonly teacher = computed(() => this.teacherService.getTeacherById(this.teacherId()));
}
