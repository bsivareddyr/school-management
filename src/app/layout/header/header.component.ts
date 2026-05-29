import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UpperCasePipe],
  template: `
    <header class="header">
      <div class="header-left">
        <h2>School Management System</h2>
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
  `]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);

  getInitials(): string {
    const name = this.authService.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
