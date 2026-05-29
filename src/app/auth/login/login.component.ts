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
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
    }
    .login-card {
      background: #fff;
      border-radius: 12px;
      padding: 40px;
      width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }
    .school-icon { font-size: 48px; }
    .login-header h1 {
      margin: 12px 0 4px;
      font-size: 22px;
      color: #1a237e;
    }
    .login-header p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .login-form { display: flex; flex-direction: column; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label {
      font-weight: 600;
      font-size: 14px;
      color: #333;
    }
    .form-group input {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    .form-group input:focus {
      outline: none;
      border-color: #1a237e;
      box-shadow: 0 0 0 3px rgba(26,35,126,0.1);
    }
    .btn-login {
      background: #1a237e;
      color: #fff;
      border: none;
      padding: 12px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 8px;
    }
    .btn-login:hover { background: #283593; }
    .error-alert {
      background: #ffebee;
      color: #c62828;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 14px;
      border: 1px solid #ef9a9a;
    }
    .demo-credentials {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
    .demo-credentials h4 {
      margin: 0 0 12px;
      font-size: 13px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .credential-grid { display: flex; flex-direction: column; gap: 6px; }
    .cred-btn {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      background: #fafafa;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cred-btn:hover { background: #e8eaf6; border-color: #1a237e; }
    .cred-role {
      font-weight: 600;
      font-size: 12px;
      color: #1a237e;
      text-transform: uppercase;
    }
    .cred-user { font-size: 12px; color: #666; }
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
