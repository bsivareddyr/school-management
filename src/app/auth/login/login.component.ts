import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <span class="school-icon">🏫</span>
          <h1>School Management System</h1>
          <p>Sign in to your account</p>
        </div>

        <form (ngSubmit)="onLogin()" class="login-form">
          @if (errorMessage()) {
            <div class="error-alert">{{ errorMessage() }}</div>
          }

          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Enter username"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Enter password"
              required
            />
          </div>

          <button type="submit" class="btn-login">Sign In</button>
        </form>

        <div class="demo-credentials">
          <h4>Demo Credentials</h4>
          <div class="credential-grid">
            @for (cred of demoCredentials; track cred.role) {
              <button class="cred-btn" (click)="fillCredentials(cred.username, cred.password)">
                <span class="cred-role">{{ cred.role }}</span>
                <span class="cred-user">{{ cred.username }} / {{ cred.password }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--sidebar-bg);
      position: relative;
      overflow: hidden;
    }
    .login-container::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 50%, rgba(79, 70, 229, 0.15), transparent 50%),
                  radial-gradient(circle at 70% 30%, rgba(129, 140, 248, 0.1), transparent 50%);
      pointer-events: none;
    }
    .login-card {
      background: var(--card-bg);
      border-radius: 20px;
      padding: 44px;
      width: 440px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
      position: relative;
      z-index: 1;
    }
    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .school-icon { font-size: 48px; }
    .login-header h1 {
      margin: 14px 0 6px;
      font-size: 24px;
      color: var(--text-primary);
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .login-header p {
      color: var(--text-secondary);
      margin: 0;
      font-size: 14px;
    }
    .login-form { display: flex; flex-direction: column; gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label {
      font-weight: 600;
      font-size: 13px;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .form-group input {
      padding: 12px 16px;
      border: 1.5px solid var(--input-border);
      border-radius: var(--input-radius);
      font-size: 14px;
      transition: var(--transition);
      background: #f8fafc;
    }
    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
      background: #fff;
    }
    .btn-login {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border: none;
      padding: 13px;
      border-radius: var(--input-radius);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: var(--transition);
      margin-top: 4px;
      letter-spacing: 0.3px;
    }
    .btn-login:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35); }
    .error-alert {
      background: var(--danger-bg);
      color: var(--danger-dark);
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 500;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .demo-credentials {
      margin-top: 28px;
      padding-top: 24px;
      border-top: 1px solid var(--border-color);
    }
    .demo-credentials h4 {
      margin: 0 0 12px;
      font-size: 11px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 700;
    }
    .credential-grid { display: flex; flex-direction: column; gap: 8px; }
    .cred-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      border: 1.5px solid var(--border-color);
      border-radius: 10px;
      background: #f8fafc;
      cursor: pointer;
      transition: var(--transition);
    }
    .cred-btn:hover { background: var(--primary-bg); border-color: var(--primary-light); transform: translateX(4px); }
    .cred-role {
      font-weight: 700;
      font-size: 12px;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .cred-user { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  errorMessage = signal('');

  readonly demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Teacher', username: 'teacher1', password: 'teacher123' },
    { role: 'Student', username: 'student1', password: 'student123' },
    { role: 'Parent', username: 'parent1', password: 'parent123' },
  ];

  fillCredentials(username: string, password: string): void {
    this.username = username;
    this.password = password;
    this.errorMessage.set('');
  }

  onLogin(): void {
    if (!this.username || !this.password) {
      this.errorMessage.set('Please enter both username and password');
      return;
    }

    if (this.authService.login(this.username, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Invalid username or password');
    }
  }
}
