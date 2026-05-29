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
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .page-header h1 { margin: 8px 0 0; color: var(--primary); }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; }
    .detail-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 20px; box-shadow: var(--card-shadow); }
    .detail-card h3 { margin: 0 0 16px; color: var(--primary); font-size: 16px; }
    .info-grid { display: flex; flex-direction: column; gap: 10px; }
    .info-item { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border-color); }
    .label { color: var(--text-secondary); font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.active { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive { background: var(--danger-bg); color: var(--danger); }
  `]
})
export class TeacherDetailComponent {
  private route = inject(ActivatedRoute);
  private teacherService = inject(TeacherService);

  private readonly teacherId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  readonly teacher = computed(() => this.teacherService.getTeacherById(this.teacherId()));
}
