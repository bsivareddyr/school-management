import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'students',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'teacher'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./students/student-list/student-list.component').then(m => m.StudentListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./students/student-form/student-form.component').then(m => m.StudentFormComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: ':id',
            loadComponent: () => import('./students/student-detail/student-detail.component').then(m => m.StudentDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./students/student-form/student-form.component').then(m => m.StudentFormComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },
      {
        path: 'attendance',
        children: [
          {
            path: '',
            loadComponent: () => import('./attendance/attendance-list/attendance-list.component').then(m => m.AttendanceListComponent),
          },
          {
            path: 'mark',
            loadComponent: () => import('./attendance/attendance-mark/attendance-mark.component').then(m => m.AttendanceMarkComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin', 'teacher'] },
          },
        ],
      },
      {
        path: 'teachers',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./teachers/teacher-list/teacher-list.component').then(m => m.TeacherListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./teachers/teacher-form/teacher-form.component').then(m => m.TeacherFormComponent),
          },
          {
            path: ':id',
            loadComponent: () => import('./teachers/teacher-detail/teacher-detail.component').then(m => m.TeacherDetailComponent),
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./teachers/teacher-form/teacher-form.component').then(m => m.TeacherFormComponent),
          },
        ],
      },
      {
        path: 'fees',
        canActivate: [roleGuard],
        data: { roles: ['admin', 'student', 'parent'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./fees/fee-list/fee-list.component').then(m => m.FeeListComponent),
          },
          {
            path: 'new',
            loadComponent: () => import('./fees/fee-form/fee-form.component').then(m => m.FeeFormComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./fees/fee-form/fee-form.component').then(m => m.FeeFormComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
          {
            path: ':id/pay',
            loadComponent: () => import('./fees/fee-form/fee-form.component').then(m => m.FeeFormComponent),
            canActivate: [roleGuard],
            data: { roles: ['admin'] },
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
