import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { AuthService } from '../shared/services/auth.service';
import { StudentService } from '../shared/services/student.service';
import { TeacherService } from '../shared/services/teacher.service';
import { AttendanceService } from '../shared/services/attendance.service';
import { FeeService } from '../shared/services/fee.service';
import { TransportService } from '../shared/services/transport.service';
import { ExamService } from '../shared/services/exam.service';

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
        <div class="stats-grid">
          <div class="stat-card teal">
            <div class="stat-icon">🚌</div>
            <div class="stat-info">
              <span class="stat-value">{{ totalRoutes() }}</span>
              <span class="stat-label">Transport Routes</span>
            </div>
          </div>
          <div class="stat-card pink">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <span class="stat-value">{{ upcomingExamsCount() }}</span>
              <span class="stat-label">Upcoming Exams</span>
            </div>
          </div>
        </div>
      }

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
        <div class="stats-grid">
          <div class="stat-card blue">
            <div class="stat-icon">📝</div>
            <div class="stat-info">
              <span class="stat-value">{{ studentExamsTaken() }}</span>
              <span class="stat-label">Exams Taken</span>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">🏆</div>
            <div class="stat-info">
              <span class="stat-value">{{ studentAvgScore() }}%</span>
              <span class="stat-label">Average Score</span>
            </div>
          </div>
          <div class="stat-card orange">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <span class="stat-value">{{ studentPassedCount() }} / {{ studentExamsTaken() }}</span>
              <span class="stat-label">Passed</span>
            </div>
          </div>
          <div class="stat-card purple">
            <div class="stat-icon">📅</div>
            <div class="stat-info">
              <span class="stat-value">{{ studentUpcomingExams() }}</span>
              <span class="stat-label">Upcoming Exams</span>
            </div>
          </div>
        </div>

        <div class="section-grid">
          <div class="section-card">
            <h3>Exam Results</h3>
            @if (studentResults().length > 0) {
              <div class="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Exam</th>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (result of studentResults(); track result.submissionId) {
                      <tr>
                        <td class="exam-name">{{ result.examName }}</td>
                        <td>{{ result.subject }}</td>
                        <td class="marks">{{ result.obtained }} / {{ result.total }}</td>
                        <td>
                          <div class="score-bar-container">
                            <div class="score-bar" [style.width.%]="result.percentage" [class.pass]="result.passed" [class.fail]="!result.passed"></div>
                            <span class="score-text">{{ result.percentage }}%</span>
                          </div>
                        </td>
                        <td>
                          <span class="result-badge" [class.pass]="result.passed" [class.fail]="!result.passed">
                            {{ result.passed ? 'PASSED' : 'FAILED' }}
                          </span>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <p class="no-data">No exam results yet. Take your first exam!</p>
            }
          </div>

          <div class="section-card">
            <h3>Quick Links</h3>
            <div class="quick-links">
              <a routerLink="/exams" class="quick-link">📝 View Exams</a>
              <a routerLink="/attendance" class="quick-link">📋 View Attendance</a>
              <a routerLink="/fees" class="quick-link">💰 View Fee Details</a>
              <a routerLink="/transport" class="quick-link">🚌 Transport Details</a>
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
              <a routerLink="/exams" class="quick-link">📝 View Exams</a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard h1 { margin: 0 0 4px; color: var(--text-primary); font-weight: 800; letter-spacing: -0.5px; }
    .welcome { color: var(--text-secondary); margin: 0 0 28px; font-size: 15px; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      padding: 22px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--card-shadow);
      transition: var(--transition);
      border: 1px solid var(--border-color);
    }
    .stat-card:hover { box-shadow: var(--card-shadow-hover); transform: translateY(-2px); }
    .stat-card.blue { border-left: 4px solid var(--info); }
    .stat-card.green { border-left: 4px solid var(--success); }
    .stat-card.orange { border-left: 4px solid var(--warning); }
    .stat-card.purple { border-left: 4px solid var(--primary); }
    .stat-card.teal { border-left: 4px solid #0d9488; }
    .stat-card.pink { border-left: 4px solid #ec4899; }
    .stat-icon { font-size: 36px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
    .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
    .section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 16px;
    }
    .section-card {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      padding: 24px;
      box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color);
    }
    .section-card h3 { margin: 0 0 18px; color: var(--text-primary); font-size: 16px; font-weight: 700; }
    .fee-overview { display: flex; flex-direction: column; gap: 10px; }
    .fee-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
    .fee-label { color: var(--text-secondary); font-size: 14px; }
    .fee-value { font-weight: 700; font-size: 15px; }
    .text-green { color: var(--success-dark); }
    .text-orange { color: var(--accent-dark); }
    .text-red { color: var(--danger); }
    .attendance-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
    .class-label { font-weight: 600; color: var(--text-primary); font-size: 14px; }
    .attendance-stats { display: flex; gap: 6px; }
    .badge {
      padding: 3px 10px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 700;
    }
    .badge.green { background: var(--success-bg); color: var(--success-dark); }
    .badge.red { background: var(--danger-bg); color: var(--danger); }
    .badge.orange { background: var(--warning-bg); color: var(--accent-dark); }
    .badge.blue { background: var(--info-bg); color: var(--info); }
    .no-data { color: var(--text-muted); font-style: italic; text-align: center; padding: 20px; }
    .quick-links { display: flex; flex-direction: column; gap: 8px; }
    .quick-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 13px 18px;
      background: #f8fafc;
      border-radius: 12px;
      text-decoration: none;
      color: var(--text-primary);
      font-weight: 600;
      font-size: 14px;
      transition: var(--transition);
      border: 1px solid transparent;
    }
    .quick-link:hover { background: var(--primary-bg); border-color: var(--primary-light); transform: translateX(4px); }
    .results-table { overflow-x: auto; }
    .results-table table { width: 100%; border-collapse: collapse; }
    .results-table th { text-align: left; padding: 12px 14px; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; border: 1px solid var(--border-color); background: #f8fafc; }
    .results-table td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    .results-table .exam-name { font-weight: 600; color: var(--text-primary); }
    .results-table .marks { font-weight: 700; color: var(--primary); }
    .score-bar-container { display: flex; align-items: center; gap: 8px; min-width: 120px; }
    .score-bar { height: 8px; border-radius: 4px; min-width: 4px; transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
    .score-bar.pass { background: linear-gradient(90deg, var(--success), #34d399); }
    .score-bar.fail { background: linear-gradient(90deg, var(--danger), #f87171); }
    .score-text { font-size: 13px; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }
    .result-badge { padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; letter-spacing: 0.3px; }
    .result-badge.pass { background: var(--success-bg); color: var(--success-dark); }
    .result-badge.fail { background: var(--danger-bg); color: var(--danger); }
  `]
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
  private studentService = inject(StudentService);
  private teacherService = inject(TeacherService);
  private attendanceService = inject(AttendanceService);
  private feeService = inject(FeeService);
  private transportService = inject(TransportService);
  private examService = inject(ExamService);

  readonly totalStudents = computed(() => this.studentService.students().filter(s => s.status === 'active').length);
  readonly totalTeachers = computed(() => this.teacherService.teachers().filter(t => t.status === 'active').length);
  readonly feeSummary = this.feeService.summary;
  readonly totalRoutes = this.transportService.totalActiveRoutes;
  readonly upcomingExamsCount = computed(() => this.examService.upcomingExams().length);

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

  private readonly studentId = computed(() => this.authService.user()?.id ?? 0);

  readonly studentSubmissions = computed(() => this.examService.getSubmissionsByStudent(this.studentId()));

  readonly studentExamsTaken = computed(() => this.studentSubmissions().length);

  readonly studentAvgScore = computed(() => {
    const subs = this.studentSubmissions();
    if (subs.length === 0) return 0;
    const avg = subs.reduce((sum, s) => sum + (s.totalMarks > 0 ? (s.obtainedMarks / s.totalMarks) * 100 : 0), 0) / subs.length;
    return Math.round(avg);
  });

  readonly studentPassedCount = computed(() => {
    const subs = this.studentSubmissions();
    return subs.filter(sub => {
      const schedule = this.examService.getSchedulesByExamId(sub.examId).find(s => s.id === sub.scheduleId);
      return schedule ? sub.obtainedMarks >= schedule.passingMarks : false;
    }).length;
  });

  readonly studentUpcomingExams = computed(() => this.examService.upcomingExams().length);

  readonly studentResults = computed(() => {
    const subs = this.studentSubmissions();
    return subs.map(sub => {
      const exam = this.examService.getExamById(sub.examId);
      const schedule = this.examService.getSchedulesByExamId(sub.examId).find(s => s.id === sub.scheduleId);
      const percentage = sub.totalMarks > 0 ? Math.round((sub.obtainedMarks / sub.totalMarks) * 100) : 0;
      const passed = schedule ? sub.obtainedMarks >= schedule.passingMarks : false;
      return {
        submissionId: sub.id,
        examName: exam?.name ?? 'Unknown Exam',
        subject: schedule?.subject ?? 'Unknown',
        obtained: sub.obtainedMarks,
        total: sub.totalMarks,
        percentage,
        passed,
        date: sub.submittedAt,
      };
    });
  });
}
