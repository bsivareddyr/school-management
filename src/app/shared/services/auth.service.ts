import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly userRole = computed(() => this.currentUser()?.role ?? null);

  private readonly users: User[] = [
    { id: 1, username: 'admin', password: 'admin123', name: 'Admin User', role: 'admin', email: 'admin@school.com' },
    { id: 2, username: 'teacher1', password: 'teacher123', name: 'John Smith', role: 'teacher', email: 'john@school.com', linkedTeacherId: 1 },
    { id: 3, username: 'student1', password: 'student123', name: 'Alice Johnson', role: 'student', email: 'alice@school.com', linkedStudentId: 1 },
    { id: 4, username: 'parent1', password: 'parent123', name: 'Robert Johnson', role: 'parent', email: 'robert@school.com', linkedStudentId: 1 },
  ];

  constructor(private router: Router) {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      this.currentUser.set(JSON.parse(saved));
    }
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }

  hasRole(...roles: Role[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }
}
