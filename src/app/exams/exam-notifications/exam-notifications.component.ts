import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-exam-notifications',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="exam-notifications">
      <a routerLink="/exams" class="back-link">← Back to Exams</a>

      @if (exam) {
        <h1>Notify Parents</h1>
        <p class="subtitle">{{ exam.name }} — Class {{ exam.class }}-{{ exam.section }}</p>

        <div class="form-card">
          <h3>Send Notification</h3>

          <div class="form-group">
            <label>Send To</label>
            <select [(ngModel)]="sendTo">
              <option value="class_parents">Class {{ exam.class }}-{{ exam.section }} Parents</option>
              <option value="all_parents">All Parents</option>
            </select>
          </div>

          <div class="form-group">
            <label>Message *</label>
            <textarea [(ngModel)]="message" rows="4" placeholder="Type your notification message..."></textarea>
          </div>

          <div class="template-buttons">
            <button class="btn-template" (click)="useTemplate('start')">📅 Exam Start Template</button>
            <button class="btn-template" (click)="useTemplate('reminder')">🔔 Reminder Template</button>
            <button class="btn-template" (click)="useTemplate('schedule')">📋 Schedule Template</button>
          </div>

          <div class="form-actions">
            <a [routerLink]="['/exams', exam.id]" class="btn-cancel">Cancel</a>
            <button class="btn-primary" (click)="sendNotification()" [disabled]="!message">📧 Send Notification</button>
          </div>
        </div>

        @if (sentNotifications.length > 0) {
          <h2>Previously Sent</h2>
          <div class="notifications-list">
            @for (notif of sentNotifications; track notif.id) {
              <div class="notif-card">
                <div class="notif-header">
                  <span class="notif-badge sent">{{ notif.status }}</span>
                  <span class="notif-date">{{ notif.sentAt }}</span>
                </div>
                <p class="notif-message">{{ notif.message }}</p>
                <div class="notif-footer">
                  <span>To: {{ notif.targetClass }} parents</span>
                  <span>By: {{ notif.sentBy }}</span>
                </div>
              </div>
            }
          </div>
        }

        @if (successMessage) {
          <div class="success-banner">{{ successMessage }}</div>
        }
      } @else {
        <p class="no-data">Exam not found</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    h1 { color: #1a237e; margin: 12px 0 4px; }
    h2 { color: #1a237e; margin: 24px 0 12px; }
    .subtitle { color: #666; margin: 0 0 20px; font-size: 14px; }
    .form-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-card h3 { margin: 0 0 16px; color: #1a237e; }
    .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    label { font-size: 13px; font-weight: 600; color: #333; }
    select, textarea { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; font-family: inherit; }
    select:focus, textarea:focus { outline: none; border-color: #1a237e; }
    textarea { resize: vertical; min-height: 100px; }
    .template-buttons { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
    .btn-template { padding: 8px 16px; border: 1px solid #e0e0e0; border-radius: 6px; background: #f5f5f5; cursor: pointer; font-size: 13px; }
    .btn-template:hover { background: #e8eaf6; border-color: #1a237e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .btn-cancel { padding: 10px 24px; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #666; font-weight: 500; display: flex; align-items: center; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .notifications-list { display: flex; flex-direction: column; gap: 12px; }
    .notif-card { background: #fff; border-radius: 10px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #2e7d32; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .notif-badge { padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 600; text-transform: capitalize; }
    .notif-badge.sent { background: #e8f5e9; color: #2e7d32; }
    .notif-date { font-size: 12px; color: #999; }
    .notif-message { color: #333; font-size: 14px; margin: 0 0 8px; }
    .notif-footer { display: flex; justify-content: space-between; font-size: 12px; color: #666; }
    .success-banner { background: #e8f5e9; color: #2e7d32; padding: 12px 20px; border-radius: 8px; margin-top: 16px; font-weight: 500; }
    .no-data { text-align: center; color: #999; font-style: italic; }
  `]
})
export class ExamNotificationsComponent {
  private activatedRoute = inject(ActivatedRoute);
  private examService = inject(ExamService);
  private authService = inject(AuthService);
  private router = inject(Router);

  exam = this.examService.getExamById(Number(this.activatedRoute.snapshot.paramMap.get('id')));
  sentNotifications = this.exam ? this.examService.getNotificationsByExamId(this.exam.id) : [];

  sendTo: 'class_parents' | 'all_parents' = 'class_parents';
  message = '';
  successMessage = '';

  useTemplate(type: string): void {
    if (!this.exam) return;
    const className = `Class ${this.exam.class}-${this.exam.section}`;
    switch (type) {
      case 'start':
        this.message = `Dear Parents,\n\nThis is to inform you that the ${this.exam.name} for ${className} will commence from ${this.exam.startDate} to ${this.exam.endDate}. Please ensure your child is well-prepared.\n\nRegards,\nSchool Management`;
        break;
      case 'reminder':
        this.message = `Dear Parents,\n\nReminder: The ${this.exam.name} for ${className} is approaching. Exams start on ${this.exam.startDate}. Please ensure regular revision and adequate rest for your child.\n\nRegards,\nSchool Management`;
        break;
      case 'schedule':
        const schedules = this.examService.getSchedulesByExamId(this.exam.id);
        const scheduleLines = schedules.map(s => `  - ${s.subject}: ${s.date} (${s.startTime}-${s.endTime}) Room: ${s.room}`).join('\n');
        this.message = `Dear Parents,\n\nHere is the exam schedule for ${this.exam.name} (${className}):\n\n${scheduleLines}\n\nPlease ensure your child is present on time.\n\nRegards,\nSchool Management`;
        break;
    }
  }

  sendNotification(): void {
    if (!this.exam || !this.message) return;
    this.examService.sendNotification({
      examId: this.exam.id,
      message: this.message,
      sentTo: this.sendTo,
      targetClass: `${this.exam.class}-${this.exam.section}`,
      sentAt: new Date().toISOString().split('T')[0],
      sentBy: this.authService.user()?.name ?? '',
      status: 'sent',
    });
    this.sentNotifications = this.examService.getNotificationsByExamId(this.exam.id);
    this.successMessage = 'Notification sent successfully to parents!';
    this.message = '';
    setTimeout(() => this.successMessage = '', 3000);
  }
}
