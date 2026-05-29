import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="sidebar">
      <div class="logo">
        <div class="logo-icon-wrap">
          <span class="logo-icon">🏫</span>
        </div>
        <div class="logo-text">
          <span class="logo-title">SMS</span>
          <span class="logo-sub">School Portal</span>
        </div>
      </div>
      <div class="nav-section">
        <span class="nav-section-label">MENU</span>
        @for (item of visibleNavItems; track item.route) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
          >
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        }
      </div>
      <div class="sidebar-footer">
        <div class="footer-badge">
          <span class="footer-dot"></span>
          <span class="footer-text">v2.0</span>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      background: var(--sidebar-bg);
      color: #fff;
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .logo-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: linear-gradient(135deg, var(--primary), var(--primary-light));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .logo-icon { font-size: 22px; }
    .logo-text { display: flex; flex-direction: column; }
    .logo-title { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .logo-sub { font-size: 11px; color: var(--text-muted); font-weight: 400; margin-top: -2px; }
    .nav-section { flex: 1; padding: 16px 12px; }
    .nav-section-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.3);
      letter-spacing: 1.5px;
      padding: 0 12px;
      margin-bottom: 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      color: rgba(255, 255, 255, 0.55);
      text-decoration: none;
      transition: var(--transition);
      font-size: 14px;
      border-radius: 10px;
      margin-bottom: 2px;
      font-weight: 500;
    }
    .nav-item:hover {
      background: var(--sidebar-hover);
      color: rgba(255, 255, 255, 0.9);
    }
    .nav-item.active {
      background: var(--sidebar-active);
      color: #fff;
      font-weight: 600;
    }
    .nav-item.active .nav-icon { transform: scale(1.1); }
    .nav-icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
      transition: transform 0.2s;
    }
    .nav-label { font-weight: inherit; }
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .footer-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      box-shadow: 0 0 8px var(--success);
    }
    .footer-text { font-size: 12px; color: var(--text-muted); }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);

  private readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard', roles: ['admin', 'teacher', 'student', 'parent'] },
    { label: 'Students', icon: '🎓', route: '/students', roles: ['admin', 'teacher'] },
    { label: 'Attendance', icon: '📋', route: '/attendance', roles: ['admin', 'teacher', 'student', 'parent'] },
    { label: 'Teachers', icon: '👩‍🏫', route: '/teachers', roles: ['admin'] },
    { label: 'Fees', icon: '💰', route: '/fees', roles: ['admin', 'student', 'parent'] },
    { label: 'Transport', icon: '🚌', route: '/transport', roles: ['admin', 'student', 'parent'] },
    { label: 'Exams', icon: '📝', route: '/exams', roles: ['admin', 'teacher', 'student', 'parent'] },
  ];

  get visibleNavItems(): NavItem[] {
    const role = this.authService.userRole();
    if (!role) return [];
    return this.navItems.filter(item => item.roles.includes(role));
  }
}
