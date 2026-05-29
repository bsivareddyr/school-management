import { Component, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [UpperCasePipe],
  template: `
    <header class="header">
      <h2>School Management System</h2>
      <div class="user-info">
        <span class="role-badge">{{ authService.userRole() | uppercase }}</span>
        <span class="user-name">{{ authService.user()?.name }}</span>
        <button class="btn-logout" (click)="authService.logout()">Logout</button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      height: 60px;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    h2 { margin: 0; font-size: 18px; color: #1a237e; }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .role-badge {
      background: #e8eaf6;
      color: #1a237e;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .user-name { font-weight: 500; color: #333; }
    .btn-logout {
      background: #e53935;
      color: #fff;
      border: none;
      padding: 6px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }
    .btn-logout:hover { background: #c62828; }
  `]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
}
