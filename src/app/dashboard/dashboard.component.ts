import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { StudentService } from '../shared/services/student.service';
import { TeacherService } from '../shared/services/teacher.service';
import { AttendanceService } from '../shared/services/attendance.service';
import { FeeService } from '../shared/services/fee.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      <p class="welcome">Welcome back, {{ authService.user()?.name }}!</p>

      <div class="stats-grid">
        @if (authService.hasRole('admin', 'teacher')) {
          <div class="stat-card blue">
            <div class="stat-icon">🎓</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalStudents() }}</span>
              <span class="stat-label">Total Students</span>
            </div>
          </div>
        }

        @if (authService.hasRole('admin')) {
          <div class="stat-card green">
            <div class="stat-icon">👩‍🏫</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalTeachers() }}</span>
              <span class="stat-label">Total Teachers</span>
            </div>
          </div>
        }

        @if (authService.hasRole('admin', 'teacher')) {
          <div class="stat-card orange">
            <div class="stat-icon">📋</div>
            <div class="stat-info">
              <span class="stat-value">{{ todayAttendanceRate() }}%</span>
              <span class="stat-label">Today's Attendance</span>
            </div>
          </div>
        }

        @if (authService.hasRole('admin')) {
          <div class="stat-card purple">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <span class="stat-value">{{ feeSummary().totalCollected | currency }}</span>
              <span class="stat-label">Fees Collected</span>
            </div>
          </div>
        }
      </div>

      @if (authService.hasRole('admin')) {
        <div class="section-grid">
          <div class="section-card">
            <h3>Fee Overview</h3>
            <div class="fee-overview">
              <div class="fee-item">
                <span class="fee-label">Total Fees</span>
                <span class="fee-value">{{ feeSummary().totalFees | currency }}</span>
              </div>
              <div class="fee-item">
                <span class="fee-label">Collected</span>
                <span class="fee-value text-green">{{ feeSummary().totalCollected | currency }}</span>
              </div>
              <div class="fee-item">
                <span class="fee-label">Pending</span>
                <span class="fee-value text-orange">{{ feeSummary().totalPending | currency }}</span>
              </div>
              <div class="fee-item">
                <span class="fee-label">Overdue</span>
                <span class="fee-value text-red">{{ feeSummary().totalOverdue | currency }}</span>
              </div>
            </div>
          </div>

          <div class="section-card">
            <h3>Today's Attendance Summary</h3>
            @for (summary of todaySummary(); track summary.class + summary.section) {
              <div class="attendance-row">
                <span class="class-label">Class {{ summary.class }}-{{ summary.section }}</span>
                <div class="attendance-stats">
                  <span class="badge green">P: {{ summary.present }}</span>
                  <span class="badge red">A: {{ summary.absent }}</span>
                  <span class="badge orange">L: {{ summary.late }}</span>
                  <span class="badge blue">E: {{ summary.excused }}</span>
                </div>
              </div>
            }
            @if (todaySummary().length === 0) {
              <p class="no-data">No attendance data for today</p>
            }
          </div>
        </div>
      }

      @if (authService.hasRole('student', 'parent')) {
        <div class="section-grid">
          <div class="section-card">
            <h3>Quick Links</h3>
            <div class="quick-links">
              <a routerLink="/attendance" class="quick-link">📋 View Attendance</a>
              <a routerLink="/fees" class="quick-link">💰 View Fee Details</a>
            </div>
          </div>
        </div>
      }

      @if (authService.hasRole('teacher')) {
        <div class="section-grid">
          <div class="section-card">
            <h3>Quick Actions</h3>
            <div class="quick-links">
              <a routerLink="/attendance/mark" class="quick-link">📋 Mark Attendance</a>
              <a routerLink="/students" class="quick-link">🎓 View Students</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard h1 { margin: 0 0 4px; color: #1a237e; }
    .welcome { color: #666; margin: 0 0 24px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .stat-card.blue { border-left: 4px solid #1565c0; }
    .stat-card.green { border-left: 4px solid #2e7d32; }
    .stat-card.orange { border-left: 4px solid #e65100; }
    .stat-card.purple { border-left: 4px solid #6a1b9a; }
    .stat-icon { font-size: 36px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 700; color: #333; }
    .stat-label { font-size: 13px; color: #666; }
    .section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 16px;
    }
    .section-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .section-card h3 { margin: 0 0 16px; color: #1a237e; font-size: 16px; }
    .fee-overview { display: flex; flex-direction: column; gap: 10px; }
    .fee-item { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .fee-label { color: #666; font-size: 14px; }
    .fee-value { font-weight: 600; font-size: 15px; }
    .text-green { color: #2e7d32; }
    .text-orange { color: #e65100; }
    .text-red { color: #c62828; }
    .attendance-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
    .class-label { font-weight: 500; color: #333; }
    .attendance-stats { display: flex; gap: 6px; }
    .badge {
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge.green { background: #e8f5e9; color: #2e7d32; }
    .badge.red { background: #ffebee; color: #c62828; }
    .badge.orange { background: #fff3e0; color: #e65100; }
    .badge.blue { background: #e3f2fd; color: #1565c0; }
    .no-data { color: #999; font-style: italic; text-align: center; padding: 20px; }
    .quick-links { display: flex; flex-direction: column; gap: 8px; }
    .quick-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f5f5f5;
      border-radius: 8px;
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: background 0.2s;
    }
    .quick-link:hover { background: #e8eaf6; }
  `]
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private attendanceService = inject(AttendanceService);
  private feeService = inject(FeeService);

  readonly totalStudents = computed(() => this.studentService.students().filter(s => s.status === 'active').length);
  readonly totalTeachers = computed(() => this.teacherService.teachers().filter(t => t.status === 'active').length);
  readonly feeSummary = this.feeService.summary;

  readonly todaySummary = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.attendanceService.getDailySummary(today);
  });

  readonly todayAttendanceRate = computed(() => {
    const summaries = this.todaySummary();
    if (summaries.length === 0) return 0;
    const total = summaries.reduce((sum, s) => sum + s.totalStudents, 0);
    const present = summaries.reduce((sum, s) => sum + s.present, 0);
    return total > 0 ? Math.round((present / total) * 100) : 0;
  });
}
