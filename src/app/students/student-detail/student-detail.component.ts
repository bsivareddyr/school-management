import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe, UpperCasePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentService } from '../../shared/services/student.service';
import { AttendanceService } from '../../shared/services/attendance.service';
import { FeeService } from '../../shared/services/fee.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-student-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, UpperCasePipe],
  template: `
    <div class="student-detail">
      @if (student(); as s) {
        <div class="page-header">
          <div>
            <a routerLink="/students" class="back-link">← Back to Students</a>
            <h1>{{ s.firstName }} {{ s.lastName }}</h1>
          </div>
          @if (authService.hasRole('admin')) {
            <a [routerLink]="['/students', s.id, 'edit']" class="btn-primary">Edit Student</a>
          }
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <h3>Personal Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Roll Number</span><span class="value">{{ s.rollNumber }}</span></div>
              <div class="info-item"><span class="label">Class</span><span class="value">{{ s.class }} - {{ s.section }}</span></div>
              <div class="info-item"><span class="label">Email</span><span class="value">{{ s.email }}</span></div>
              <div class="info-item"><span class="label">Phone</span><span class="value">{{ s.phone }}</span></div>
              <div class="info-item"><span class="label">Date of Birth</span><span class="value">{{ s.dateOfBirth }}</span></div>
              <div class="info-item"><span class="label">Gender</span><span class="value capitalize">{{ s.gender }}</span></div>
              <div class="info-item"><span class="label">Address</span><span class="value">{{ s.address }}</span></div>
              <div class="info-item"><span class="label">Admission Date</span><span class="value">{{ s.admissionDate }}</span></div>
              <div class="info-item"><span class="label">Status</span><span class="value"><span class="status-badge" [class]="s.status">{{ s.status }}</span></span></div>
            </div>
          </div>

          <div class="detail-card">
            <h3>Parent/Guardian Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Parent Name</span><span class="value">{{ s.parentName }}</span></div>
              <div class="info-item"><span class="label">Parent Phone</span><span class="value">{{ s.parentPhone }}</span></div>
            </div>
          </div>
        </div>

        <div class="detail-grid" style="margin-top: 16px">
          <div class="detail-card">
            <h3>Recent Attendance</h3>
            @for (record of studentAttendance(); track record.id) {
              <div class="attendance-row">
                <span>{{ record.date }}</span>
                <span class="status-badge" [class]="record.status">{{ record.status }}</span>
              </div>
            } @empty {
              <p class="no-data">No attendance records</p>
            }
          </div>

          @if (authService.hasRole('admin', 'student', 'parent')) {
            <div class="detail-card">
              <h3>Fee Records</h3>
              @for (fee of studentFees(); track fee.id) {
                <div class="fee-row">
                  <div>
                    <span class="fee-type">{{ fee.feeType | uppercase }}</span>
                    <span class="fee-amount">{{ fee.amount | currency }}</span>
                  </div>
                  <span class="status-badge" [class]="fee.paymentStatus">{{ fee.paymentStatus }}</span>
                </div>
              } @empty {
                <p class="no-data">No fee records</p>
              }
            </div>
          }
        </div>
      } @else {
        <p>Student not found.</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; font-weight: 500; }
    .back-link:hover { text-decoration: underline; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
    .page-header h1 { margin: 8px 0 0; color: var(--text-primary); font-weight: 800; letter-spacing: -0.5px; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 22px; border-radius: 10px; text-decoration: none; font-weight: 700; transition: var(--transition); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; }
    .detail-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 24px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    .detail-card h3 { margin: 0 0 18px; color: var(--text-primary); font-size: 16px; font-weight: 700; }
    .info-grid { display: flex; flex-direction: column; gap: 10px; }
    .info-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
    .label { color: var(--text-secondary); font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; color: var(--text-primary); }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.active, .status-badge.present, .status-badge.paid { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive, .status-badge.absent, .status-badge.overdue { background: var(--danger-bg); color: var(--danger); }
    .status-badge.late, .status-badge.partial, .status-badge.pending { background: var(--warning-bg); color: var(--accent-dark); }
    .status-badge.excused { background: var(--info-bg); color: var(--info); }
    .attendance-row, .fee-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
    .fee-type { font-weight: 600; text-transform: capitalize; margin-right: 8px; }
    .fee-amount { color: var(--text-secondary); font-size: 14px; }
    .no-data { color: var(--text-muted); font-style: italic; text-align: center; padding: 20px; }
  `]
})
export class StudentDetailComponent {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentService);
  private attendanceService = inject(AttendanceService);
  private feeService = inject(FeeService);
  readonly authService = inject(AuthService);

  private readonly studentId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  readonly student = computed(() => this.studentService.getStudentById(this.studentId()));
  readonly studentAttendance = computed(() => this.attendanceService.getByStudent(this.studentId()).slice(0, 10));
  readonly studentFees = computed(() => this.feeService.getByStudent(this.studentId()));
}
