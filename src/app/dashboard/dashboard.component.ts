import { Component, inject, computed, signal, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
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
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="welcome">Welcome back, {{ authService.user()?.name }}!</p>
        </div>
        <div class="header-date">
          <span class="date-icon">📅</span>
          <span>{{ today }}</span>
        </div>
      </div>

      <!-- Admin Dashboard -->
      @if (authService.hasRole('admin')) {
        <div class="stats-grid four-col">
          <div class="stat-card gradient-blue">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Total Students</span>
                <span class="stat-value">{{ totalStudents() }}</span>
                <span class="stat-change positive">Active enrollment</span>
              </div>
              <div class="stat-icon-wrap blue">🎓</div>
            </div>
          </div>
          <div class="stat-card gradient-green">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Total Teachers</span>
                <span class="stat-value">{{ totalTeachers() }}</span>
                <span class="stat-change positive">Active faculty</span>
              </div>
              <div class="stat-icon-wrap green">👩‍🏫</div>
            </div>
          </div>
          <div class="stat-card gradient-orange">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Today's Attendance</span>
                <span class="stat-value">{{ todayAttendanceRate() }}%</span>
                <span class="stat-change" [class.positive]="todayAttendanceRate() >= 75" [class.negative]="todayAttendanceRate() < 75">
                  {{ todayAttendanceRate() >= 75 ? 'Good rate' : 'Needs attention' }}
                </span>
              </div>
              <div class="stat-icon-wrap orange">📋</div>
            </div>
          </div>
          <div class="stat-card gradient-purple">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Fees Collected</span>
                <span class="stat-value">{{ feeSummary().totalCollected | currency:'USD':'symbol':'1.0-0' }}</span>
                <span class="stat-change">of {{ feeSummary().totalFees | currency:'USD':'symbol':'1.0-0' }}</span>
              </div>
              <div class="stat-icon-wrap purple">💰</div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="charts-grid">
          <!-- Fee Collection Donut Chart -->
          <div class="chart-card">
            <h3>Fee Collection Overview</h3>
            <div class="donut-chart-container">
              <div class="donut-chart" [style.background]="feeDonutGradient()">
                <div class="donut-hole">
                  <span class="donut-value">{{ feeCollectionRate() }}%</span>
                  <span class="donut-label">Collected</span>
                </div>
              </div>
              <div class="donut-legend">
                <div class="legend-item"><span class="legend-dot collected"></span><span>Collected</span><span class="legend-val">{{ feeSummary().totalCollected | currency }}</span></div>
                <div class="legend-item"><span class="legend-dot pending"></span><span>Pending</span><span class="legend-val">{{ feeSummary().totalPending | currency }}</span></div>
                <div class="legend-item"><span class="legend-dot overdue"></span><span>Overdue</span><span class="legend-val">{{ feeSummary().totalOverdue | currency }}</span></div>
              </div>
            </div>
          </div>

          <!-- Student Distribution Bar Chart -->
          <div class="chart-card">
            <h3>Students by Class</h3>
            <div class="bar-chart">
              @for (item of classDistribution(); track item.class) {
                <div class="bar-row">
                  <span class="bar-label">Class {{ item.class }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="item.percentage" [class]="'bar-color-' + item.colorIndex"></div>
                  </div>
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Attendance Summary Chart -->
          <div class="chart-card">
            <h3>Today's Attendance</h3>
            <div class="attendance-chart">
              @for (summary of todaySummary(); track summary.class + summary.section) {
                <div class="att-class-row">
                  <span class="att-class-label">{{ summary.class }}-{{ summary.section }}</span>
                  <div class="att-stacked-bar">
                    @if (summary.totalStudents > 0) {
                      <div class="att-segment present" [style.width.%]="(summary.present / summary.totalStudents) * 100" title="Present: {{ summary.present }}"></div>
                      <div class="att-segment late" [style.width.%]="(summary.late / summary.totalStudents) * 100" title="Late: {{ summary.late }}"></div>
                      <div class="att-segment absent" [style.width.%]="(summary.absent / summary.totalStudents) * 100" title="Absent: {{ summary.absent }}"></div>
                    }
                  </div>
                  <span class="att-total">{{ summary.totalStudents }}</span>
                </div>
              }
              @if (todaySummary().length === 0) {
                <p class="no-data">No attendance data for today</p>
              }
              <div class="att-legend">
                <span class="att-legend-item"><span class="att-dot present"></span>Present</span>
                <span class="att-legend-item"><span class="att-dot late"></span>Late</span>
                <span class="att-legend-item"><span class="att-dot absent"></span>Absent</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Row: Fee Details + Quick Stats -->
        <div class="bottom-grid">
          <div class="section-card">
            <div class="section-header-row">
              <h3>Fee Breakdown</h3>
              <a routerLink="/fees" class="view-all-link">View All →</a>
            </div>
            <div class="fee-overview">
              <div class="fee-item">
                <div class="fee-icon-wrap blue-bg">💵</div>
                <div class="fee-details">
                  <span class="fee-label">Total Fees</span>
                  <span class="fee-value">{{ feeSummary().totalFees | currency }}</span>
                </div>
              </div>
              <div class="fee-item">
                <div class="fee-icon-wrap green-bg">✅</div>
                <div class="fee-details">
                  <span class="fee-label">Collected</span>
                  <span class="fee-value text-green">{{ feeSummary().totalCollected | currency }}</span>
                </div>
              </div>
              <div class="fee-item">
                <div class="fee-icon-wrap orange-bg">⏳</div>
                <div class="fee-details">
                  <span class="fee-label">Pending</span>
                  <span class="fee-value text-orange">{{ feeSummary().totalPending | currency }}</span>
                </div>
              </div>
              <div class="fee-item">
                <div class="fee-icon-wrap red-bg">⚠️</div>
                <div class="fee-details">
                  <span class="fee-label">Overdue</span>
                  <span class="fee-value text-red">{{ feeSummary().totalOverdue | currency }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="section-header-row">
              <h3>Quick Overview</h3>
            </div>
            <div class="quick-stats-grid">
              <div class="mini-stat">
                <span class="mini-stat-icon">🚌</span>
                <div class="mini-stat-info">
                  <span class="mini-stat-value">{{ totalRoutes() }}</span>
                  <span class="mini-stat-label">Transport Routes</span>
                </div>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-icon">📝</span>
                <div class="mini-stat-info">
                  <span class="mini-stat-value">{{ upcomingExamsCount() }}</span>
                  <span class="mini-stat-label">Upcoming Exams</span>
                </div>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-icon">🎓</span>
                <div class="mini-stat-info">
                  <span class="mini-stat-value">{{ totalStudentsTransport() }}</span>
                  <span class="mini-stat-label">Using Transport</span>
                </div>
              </div>
              <div class="mini-stat">
                <span class="mini-stat-icon">📊</span>
                <div class="mini-stat-info">
                  <span class="mini-stat-value">{{ totalExams() }}</span>
                  <span class="mini-stat-label">Total Exams</span>
                </div>
              </div>
            </div>
            <div class="quick-actions-row">
              <a routerLink="/students" class="quick-action-btn">Students</a>
              <a routerLink="/attendance/mark" class="quick-action-btn">Mark Attendance</a>
              <a routerLink="/exams/new" class="quick-action-btn">Create Exam</a>
            </div>
          </div>
        </div>
      }

      <!-- Student / Parent Dashboard -->
      @if (authService.hasRole('student', 'parent')) {
        <div class="stats-grid four-col">
          <div class="stat-card gradient-blue">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Exams Taken</span>
                <span class="stat-value">{{ studentExamsTaken() }}</span>
              </div>
              <div class="stat-icon-wrap blue">📝</div>
            </div>
          </div>
          <div class="stat-card gradient-green">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Average Score</span>
                <span class="stat-value">{{ studentAvgScore() }}%</span>
              </div>
              <div class="stat-icon-wrap green">🏆</div>
            </div>
          </div>
          <div class="stat-card gradient-orange">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Passed</span>
                <span class="stat-value">{{ studentPassedCount() }} / {{ studentExamsTaken() }}</span>
              </div>
              <div class="stat-icon-wrap orange">✅</div>
            </div>
          </div>
          <div class="stat-card gradient-purple">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Upcoming Exams</span>
                <span class="stat-value">{{ studentUpcomingExams() }}</span>
              </div>
              <div class="stat-icon-wrap purple">📅</div>
            </div>
          </div>
        </div>

        <div class="bottom-grid">
          <div class="section-card wide">
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

      <!-- Teacher Dashboard -->
      @if (authService.hasRole('teacher')) {
        <div class="stats-grid four-col">
          <div class="stat-card gradient-blue">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Total Students</span>
                <span class="stat-value">{{ totalStudents() }}</span>
              </div>
              <div class="stat-icon-wrap blue">🎓</div>
            </div>
          </div>
          <div class="stat-card gradient-orange">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Today's Attendance</span>
                <span class="stat-value">{{ todayAttendanceRate() }}%</span>
              </div>
              <div class="stat-icon-wrap orange">📋</div>
            </div>
          </div>
          <div class="stat-card gradient-purple">
            <div class="stat-card-inner">
              <div class="stat-info">
                <span class="stat-label">Upcoming Exams</span>
                <span class="stat-value">{{ upcomingExamsCount() }}</span>
              </div>
              <div class="stat-icon-wrap purple">📝</div>
            </div>
          </div>
        </div>
        <div class="bottom-grid">
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
    .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .dashboard h1 { margin: 0 0 4px; color: var(--text-primary); font-weight: 800; font-size: 26px; letter-spacing: -0.5px; }
    .welcome { color: var(--text-secondary); margin: 0; font-size: 15px; }
    .header-date { display: flex; align-items: center; gap: 8px; background: var(--card-bg); padding: 10px 18px; border-radius: 12px; border: 1px solid var(--border-color); font-size: 14px; color: var(--text-secondary); font-weight: 600; }
    .date-icon { font-size: 16px; }

    /* Stats Grid */
    .stats-grid { display: grid; gap: 16px; margin-bottom: 24px; }
    .stats-grid.four-col { grid-template-columns: repeat(4, 1fr); }
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
      opacity: 0.1;
      transform: translate(30%, -30%);
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
    .gradient-blue { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; }
    .gradient-blue::before { background: #fff; }
    .gradient-green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
    .gradient-green::before { background: #fff; }
    .gradient-orange { background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; }
    .gradient-orange::before { background: #fff; }
    .gradient-purple { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; }
    .gradient-purple::before { background: #fff; }
    .stat-card-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .stat-value { font-size: 32px; font-weight: 800; letter-spacing: -1px; }
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

    /* Charts Grid */
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      padding: 24px;
      box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color);
    }
    .chart-card h3 { margin: 0 0 20px; font-size: 15px; font-weight: 700; color: var(--text-primary); }

    /* Donut Chart */
    .donut-chart-container { display: flex; align-items: center; gap: 24px; }
    .donut-chart {
      width: 140px; height: 140px;
      border-radius: 50%;
      position: relative;
      flex-shrink: 0;
    }
    .donut-hole {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 90px; height: 90px;
      border-radius: 50%;
      background: var(--card-bg);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .donut-value { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
    .donut-label { font-size: 11px; color: var(--text-muted); font-weight: 500; }
    .donut-legend { display: flex; flex-direction: column; gap: 10px; flex: 1; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
    .legend-dot.collected { background: #10b981; }
    .legend-dot.pending { background: #f59e0b; }
    .legend-dot.overdue { background: #ef4444; }
    .legend-val { margin-left: auto; font-weight: 700; color: var(--text-primary); font-size: 13px; }

    /* Bar Chart */
    .bar-chart { display: flex; flex-direction: column; gap: 12px; }
    .bar-row { display: flex; align-items: center; gap: 12px; }
    .bar-label { width: 60px; font-size: 13px; color: var(--text-secondary); font-weight: 600; flex-shrink: 0; }
    .bar-track { flex: 1; height: 22px; background: #f1f5f9; border-radius: 6px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 6px; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); min-width: 4px; }
    .bar-color-0 { background: linear-gradient(90deg, #4f46e5, #6366f1); }
    .bar-color-1 { background: linear-gradient(90deg, #059669, #10b981); }
    .bar-color-2 { background: linear-gradient(90deg, #d97706, #f59e0b); }
    .bar-color-3 { background: linear-gradient(90deg, #7c3aed, #8b5cf6); }
    .bar-color-4 { background: linear-gradient(90deg, #0891b2, #06b6d4); }
    .bar-value { width: 30px; font-size: 14px; font-weight: 700; color: var(--text-primary); text-align: right; }

    /* Attendance Stacked Bar */
    .attendance-chart { display: flex; flex-direction: column; gap: 10px; }
    .att-class-row { display: flex; align-items: center; gap: 10px; }
    .att-class-label { width: 40px; font-size: 13px; font-weight: 700; color: var(--text-secondary); flex-shrink: 0; }
    .att-stacked-bar { flex: 1; height: 20px; background: #f1f5f9; border-radius: 6px; display: flex; overflow: hidden; }
    .att-segment { height: 100%; transition: width 0.4s ease; min-width: 0; }
    .att-segment.present { background: #10b981; }
    .att-segment.late { background: #f59e0b; }
    .att-segment.absent { background: #ef4444; }
    .att-total { width: 24px; font-size: 13px; font-weight: 700; color: var(--text-muted); text-align: right; }
    .att-legend { display: flex; gap: 16px; margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--border-color); }
    .att-legend-item { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-secondary); font-weight: 500; }
    .att-dot { width: 8px; height: 8px; border-radius: 2px; }
    .att-dot.present { background: #10b981; }
    .att-dot.late { background: #f59e0b; }
    .att-dot.absent { background: #ef4444; }

    /* Bottom Grid */
    .bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .section-card {
      background: var(--card-bg);
      border-radius: var(--card-radius);
      padding: 24px;
      box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color);
    }
    .section-card.wide { grid-column: 1 / -1; }
    .section-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .section-header-row h3, .section-card h3 { margin: 0 0 18px; font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .section-header-row h3 { margin-bottom: 0; }
    .view-all-link { font-size: 13px; color: var(--primary); text-decoration: none; font-weight: 600; }
    .view-all-link:hover { text-decoration: underline; }

    /* Fee Overview */
    .fee-overview { display: flex; flex-direction: column; gap: 4px; }
    .fee-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--border-color); }
    .fee-item:last-child { border-bottom: none; }
    .fee-icon-wrap { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
    .blue-bg { background: #eef2ff; }
    .green-bg { background: #ecfdf5; }
    .orange-bg { background: #fffbeb; }
    .red-bg { background: #fef2f2; }
    .fee-details { display: flex; flex-direction: column; flex: 1; }
    .fee-label { color: var(--text-secondary); font-size: 13px; }
    .fee-value { font-weight: 700; font-size: 16px; color: var(--text-primary); }
    .text-green { color: var(--success-dark); }
    .text-orange { color: var(--accent-dark); }
    .text-red { color: var(--danger); }

    /* Quick Stats */
    .quick-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
    .mini-stat { display: flex; align-items: center; gap: 12px; padding: 14px; background: #f8fafc; border-radius: 12px; border: 1px solid var(--border-color); }
    .mini-stat-icon { font-size: 22px; }
    .mini-stat-info { display: flex; flex-direction: column; }
    .mini-stat-value { font-size: 20px; font-weight: 800; color: var(--text-primary); }
    .mini-stat-label { font-size: 11px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; }
    .quick-actions-row { display: flex; gap: 8px; flex-wrap: wrap; }
    .quick-action-btn {
      padding: 8px 16px;
      background: var(--primary-bg);
      color: var(--primary);
      border-radius: 8px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      transition: var(--transition);
    }
    .quick-action-btn:hover { background: var(--primary); color: #fff; }

    /* Quick Links */
    .quick-links { display: flex; flex-direction: column; gap: 8px; }
    .quick-link {
      display: flex; align-items: center; gap: 10px;
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

    /* Results Table */
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
    .no-data { color: var(--text-muted); font-style: italic; text-align: center; padding: 20px; }

    @media (max-width: 1024px) {
      .stats-grid.four-col { grid-template-columns: repeat(2, 1fr); }
      .charts-grid { grid-template-columns: 1fr; }
      .bottom-grid { grid-template-columns: 1fr; }
    }
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

  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  readonly totalStudents = computed(() => this.studentService.students().filter(s => s.status === 'active').length);
  readonly totalTeachers = computed(() => this.teacherService.teachers().filter(t => t.status === 'active').length);
  readonly feeSummary = this.feeService.summary;
  readonly totalRoutes = this.transportService.totalActiveRoutes;
  readonly totalStudentsTransport = this.transportService.totalStudentsUsingTransport;
  readonly totalExams = this.examService.totalExams;
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

  readonly classDistribution = computed(() => {
    const students = this.studentService.students().filter(s => s.status === 'active');
    const classMap = new Map<string, number>();
    students.forEach(s => classMap.set(s.class, (classMap.get(s.class) || 0) + 1));
    const entries = Array.from(classMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const max = Math.max(...entries.map(e => e[1]), 1);
    return entries.map((e, i) => ({ class: e[0], count: e[1], percentage: (e[1] / max) * 100, colorIndex: i % 5 }));
  });

  readonly feeCollectionRate = computed(() => {
    const summary = this.feeSummary();
    return summary.totalFees > 0 ? Math.round((summary.totalCollected / summary.totalFees) * 100) : 0;
  });

  readonly feeDonutGradient = computed(() => {
    const summary = this.feeSummary();
    const total = summary.totalFees || 1;
    const collected = (summary.totalCollected / total) * 100;
    const pending = (summary.totalPending / total) * 100;
    const collectedEnd = collected;
    const pendingEnd = collectedEnd + pending;
    return `conic-gradient(#10b981 0% ${collectedEnd}%, #f59e0b ${collectedEnd}% ${pendingEnd}%, #ef4444 ${pendingEnd}% 100%)`;
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
