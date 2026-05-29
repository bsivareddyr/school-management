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
        <span class="logo-icon">🏫</span>
        <span class="logo-text">SMS</span>
      </div>
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
    </nav>
  `,
  styles: [`
    .sidebar {
      width: 220px;
      background: #1a237e;
      color: #fff;
      display: flex;
      flex-direction: column;
      padding: 16px 0;
      flex-shrink: 0;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 0 20px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      margin-bottom: 8px;
    }
    .logo-icon { font-size: 28px; }
    .logo-text { font-size: 22px; font-weight: 700; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 20px;
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      transition: all 0.2s;
      font-size: 14px;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.1);
      color: #fff;
    }
    .nav-item.active {
      background: rgba(255,255,255,0.15);
      color: #fff;
      border-right: 3px solid #ffd54f;
    }
    .nav-icon { font-size: 18px; width: 24px; text-align: center; }
    .nav-label { font-weight: 500; }
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
  ];

  get visibleNavItems(): NavItem[] {
    const role = this.authService.userRole();
    if (!role) return [];
    return this.navItems.filter(item => item.roles.includes(role));
  }
}
