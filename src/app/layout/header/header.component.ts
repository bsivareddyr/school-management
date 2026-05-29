import { Component, inject, computed, signal, HostListener } from '@angular/core';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ExamService } from '../../shared/services/exam.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UpperCasePipe, DatePipe, RouterLink],
  template: `
    <header class="header">
      <div class="header-left">
        <h2>School Management System</h2>
      </div>
      <div class="header-right">
        <!-- Notification Bell -->
        <div class="notification-wrapper">
          <button class="notification-btn" (click)="toggleNotifications($event)">
            <span class="bell-icon">🔔</span>
            @if (upcomingExams().length > 0) {
              <span class="notification-badge">{{ upcomingExams().length }}</span>
            }
          </button>
          @if (showNotifications()) {
            <div class="notification-dropdown">
              <div class="notif-header">
                <span class="notif-title">Upcoming Exams</span>
                <span class="notif-count">{{ upcomingExams().length }}</span>
              </div>
              <div class="notif-list">
                @for (exam of upcomingExams(); track exam.id) {
                  <a [routerLink]="['/exams', exam.id]" class="notif-item" (click)="showNotifications.set(false)">
                    <div class="notif-icon-wrap">📝</div>
                    <div class="notif-content">
                      <span class="notif-name">{{ exam.name }}</span>
                      <span class="notif-detail">Class {{ exam.class }}-{{ exam.section }} · {{ exam.type.replace('_', ' ') }}</span>
                      <span class="notif-date">{{ exam.startDate | date:'mediumDate' }} - {{ exam.endDate | date:'mediumDate' }}</span>
                    </div>
                    <span class="notif-status-badge">{{ exam.status }}</span>
                  </a>
                } @empty {
                  <div class="notif-empty">No upcoming exams</div>
                }
              </div>
              @if (upcomingExams().length > 0) {
                <a routerLink="/exams" class="notif-footer" (click)="showNotifications.set(false)">View All Exams →</a>
              }
            </div>
          }
        </div>

        <div class="user-info">
          <div class="user-details">
            <span class="user-name">{{ authService.user()?.name }}</span>
            <span class="role-badge">{{ authService.userRole() | uppercase }}</span>
          </div>
          <div class="user-avatar">{{ getInitials() }}</div>
          <button class="btn-logout" (click)="authService.logout()">
            <span class="logout-icon">&#x2192;</span>
            Logout
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 32px;
      height: 64px;
      background: var(--header-bg);
      border-bottom: 1px solid var(--border-color);
      backdrop-filter: blur(10px);
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    h2 { margin: 0; font-size: 18px; color: var(--text-primary); font-weight: 700; letter-spacing: -0.3px; }
    .header-right { display: flex; align-items: center; gap: 20px; }
    .user-info { display: flex; align-items: center; gap: 16px; }
    .user-details { display: flex; flex-direction: column; align-items: flex-end; }
    .user-name { font-weight: 600; font-size: 14px; color: var(--text-primary); }
    .role-badge {
      background: var(--primary-bg);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 7px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: var(--transition);
    }
    .btn-logout:hover {
      background: var(--danger-bg);
      color: var(--danger);
      border-color: var(--danger);
    }
    .logout-icon { font-size: 14px; }

    /* Notification Bell */
    .notification-wrapper { position: relative; }
    .notification-btn {
      position: relative;
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
    }
    .notification-btn:hover { background: #f8fafc; border-color: var(--primary-light); }
    .bell-icon { font-size: 18px; }
    .notification-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      background: var(--danger);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      border: 2px solid var(--header-bg);
    }

    /* Dropdown */
    .notification-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 380px;
      background: var(--card-bg);
      border-radius: var(--card-radius);
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      border: 1px solid var(--border-color);
      z-index: 1000;
      overflow: hidden;
    }
    .notif-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border-color);
    }
    .notif-title { font-size: 14px; font-weight: 700; color: var(--text-primary); }
    .notif-count {
      background: var(--primary-bg);
      color: var(--primary);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
    }
    .notif-list { max-height: 320px; overflow-y: auto; }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px 20px;
      text-decoration: none;
      border-bottom: 1px solid var(--border-color);
      transition: var(--transition);
      cursor: pointer;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item:last-child { border-bottom: none; }
    .notif-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--primary-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    .notif-content { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
    .notif-name { font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-detail { font-size: 12px; color: var(--text-secondary); text-transform: capitalize; }
    .notif-date { font-size: 11px; color: var(--text-muted); font-weight: 500; }
    .notif-status-badge {
      padding: 3px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      background: var(--info-bg);
      color: var(--info);
      text-transform: capitalize;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .notif-empty { padding: 30px 20px; text-align: center; color: var(--text-muted); font-size: 14px; }
    .notif-footer {
      display: block;
      text-align: center;
      padding: 12px;
      font-size: 13px;
      color: var(--primary);
      font-weight: 700;
      text-decoration: none;
      border-top: 1px solid var(--border-color);
      transition: var(--transition);
    }
    .notif-footer:hover { background: var(--primary-bg); }
  `]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  private examService = inject(ExamService);

  showNotifications = signal(false);

  readonly upcomingExams = computed(() => this.examService.upcomingExams());

  getInitials(): string {
    const name = this.authService.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.showNotifications.update(v => !v);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.showNotifications()) {
      this.showNotifications.set(false);
    }
  }
}
