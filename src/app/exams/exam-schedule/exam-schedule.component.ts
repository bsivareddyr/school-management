import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExamSchedule } from '../../shared/models/exam.model';

@Component({
  selector: 'app-exam-schedule',
  standalone: true,
  imports: [RouterLink, FormsModule, TitleCasePipe],
  template: `
    <div class="exam-schedule">
      <a routerLink="/exams" class="back-link">← Back to Exams</a>

      @if (exam) {
        <div class="page-header">
          <div>
            <h1>{{ exam.name }}</h1>
            <p class="subtitle">Class {{ exam.class }}-{{ exam.section }} | {{ exam.type.replace('_', ' ') | titlecase }} | {{ exam.academicYear }}</p>
          </div>
          @if (authService.hasRole('admin')) {
            <div class="header-actions">
              <a [routerLink]="['/exams', exam.id, 'notify']" class="btn-secondary">📧 Notify Parents</a>
              <a [routerLink]="['/exams', exam.id, 'edit']" class="btn-primary">Edit Exam</a>
            </div>
          }
        </div>

        <div class="info-cards">
          <div class="info-card">
            <span class="info-label">Start Date</span>
            <span class="info-value">{{ exam.startDate }}</span>
          </div>
          <div class="info-card">
            <span class="info-label">End Date</span>
            <span class="info-value">{{ exam.endDate }}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Status</span>
            <span class="status-badge" [class]="exam.status">{{ exam.status }}</span>
          </div>
          <div class="info-card">
            <span class="info-label">Created By</span>
            <span class="info-value">{{ exam.createdBy }}</span>
          </div>
        </div>

        <div class="section-header">
          <h2>Exam Schedule</h2>
          @if (authService.hasRole('admin') && !showAddForm) {
            <button class="btn-secondary" (click)="showAddForm = true">+ Add Subject</button>
          }
        </div>

        @if (showAddForm && authService.hasRole('admin')) {
          <div class="add-form-card">
            <h3>Add Subject to Schedule</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Subject *</label>
                <input type="text" [(ngModel)]="newSchedule.subject" placeholder="e.g. Mathematics" />
              </div>
              <div class="form-group">
                <label>Date *</label>
                <input type="date" [(ngModel)]="newSchedule.date" />
              </div>
              <div class="form-group">
                <label>Start Time *</label>
                <input type="time" [(ngModel)]="newSchedule.startTime" />
              </div>
              <div class="form-group">
                <label>End Time *</label>
                <input type="time" [(ngModel)]="newSchedule.endTime" />
              </div>
              <div class="form-group">
                <label>Room *</label>
                <input type="text" [(ngModel)]="newSchedule.room" placeholder="e.g. Hall A" />
              </div>
              <div class="form-group">
                <label>Max Marks *</label>
                <input type="number" [(ngModel)]="newSchedule.maxMarks" />
              </div>
              <div class="form-group">
                <label>Passing Marks *</label>
                <input type="number" [(ngModel)]="newSchedule.passingMarks" />
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" (click)="showAddForm = false">Cancel</button>
              <button class="btn-primary" (click)="addScheduleEntry()">Add Subject</button>
            </div>
          </div>
        }

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Room</th>
                <th>Max Marks</th>
                <th>Pass Marks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (schedule of schedules; track schedule.id) {
                <tr>
                  <td class="subject-name">{{ schedule.subject }}</td>
                  <td>{{ schedule.date }}</td>
                  <td>{{ schedule.startTime }}</td>
                  <td>{{ schedule.endTime }}</td>
                  <td>{{ schedule.room }}</td>
                  <td>{{ schedule.maxMarks }}</td>
                  <td>{{ schedule.passingMarks }}</td>
                  <td>
                    <div class="actions">
                      @if (authService.hasRole('student')) {
                        @if (getSubmission(schedule.id); as sub) {
                          <a [routerLink]="['/exams', exam!.id, 'schedule', schedule.id, 'result']" class="btn-action result" title="View Result">📊 Result</a>
                        } @else {
                          <a [routerLink]="['/exams', exam!.id, 'take', schedule.id]" class="btn-action take" title="Take Exam">✏️ Take Exam</a>
                        }
                      }
                      @if (authService.hasRole('admin') || authService.hasRole('teacher')) {
                        <a [routerLink]="['/exams', exam!.id, 'schedule', schedule.id, 'questions']" class="btn-action questions" title="Manage Questions">📝 Questions ({{ getQuestionCount(schedule.id) }})</a>
                      }
                      @if (authService.hasRole('admin')) {
                        <button class="btn-icon delete" (click)="deleteScheduleEntry(schedule.id)" title="Remove">🗑</button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="8" class="no-data">No schedule entries yet. Add subjects above.</td></tr>
              }
            </tbody>
          </table>
        </div>

        @if (notifications.length > 0) {
          <h2 class="section-title">Notifications Sent</h2>
          <div class="notifications-list">
            @for (notif of notifications; track notif.id) {
              <div class="notif-card">
                <div class="notif-header">
                  <span class="notif-badge" [class]="notif.status">{{ notif.status }}</span>
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
      } @else {
        <p class="no-data">Exam not found</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin: 12px 0 20px; }
    .page-header h1 { margin: 0; color: var(--primary); }
    .subtitle { color: var(--text-secondary); margin: 4px 0 0; font-size: 14px; text-transform: capitalize; }
    .header-actions { display: flex; gap: 8px; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border: none; border-radius: 10px; text-decoration: none; font-weight: 700; cursor: pointer; }
    .btn-secondary { background: var(--card-bg); color: var(--primary); padding: 10px 20px; border: 1px solid #1a237e; border-radius: 10px; text-decoration: none; font-weight: 700; cursor: pointer; }
    .info-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 24px; }
    .info-card { background: var(--card-bg); border-radius: 10px; padding: 16px; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; }
    .info-value { font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2, .section-title { margin: 24px 0 16px; color: var(--primary); font-size: 18px; }
    .add-form-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 20px; margin-bottom: 16px; box-shadow: var(--card-shadow); border-left: 4px solid #1a237e; }
    .add-form-card h3 { margin: 0 0 16px; color: var(--primary); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    label { font-size: 12px; font-weight: 700; color: var(--text-primary); }
    input { padding: 8px 12px; border: 1.5px solid var(--input-border); border-radius: 6px; font-size: 14px; }
    input:focus { outline: none; border-color: var(--primary); }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
    .btn-cancel { padding: 8px 20px; border: 1.5px solid var(--input-border); border-radius: 6px; background: var(--card-bg); color: var(--text-secondary); cursor: pointer; }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 14px 16px; text-align: left; font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid var(--border-color); }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .subject-name { font-weight: 600; color: var(--text-primary); }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.scheduled { background: var(--info-bg); color: var(--info); }
    .status-badge.ongoing { background: var(--warning-bg); color: var(--accent-dark); }
    .status-badge.completed { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.cancelled { background: var(--danger-bg); color: var(--danger); }
    .actions { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .btn-action { padding: 4px 10px; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: 600; white-space: nowrap; }
    .btn-action.take { background: var(--info-bg); color: var(--info); }
    .btn-action.take:hover { background: #bbdefb; }
    .btn-action.result { background: var(--success-bg); color: var(--success-dark); }
    .btn-action.result:hover { background: #c8e6c9; }
    .btn-action.questions { background: #f3e5f5; color: #7b1fa2; }
    .btn-action.questions:hover { background: #e1bee7; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .notifications-list { display: flex; flex-direction: column; gap: 12px; }
    .notif-card { background: var(--card-bg); border-radius: 10px; padding: 16px; box-shadow: var(--card-shadow); border-left: 4px solid #2e7d32; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .notif-badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
    .notif-badge.sent { background: var(--success-bg); color: var(--success-dark); }
    .notif-badge.pending { background: var(--warning-bg); color: var(--accent-dark); }
    .notif-date { font-size: 12px; color: var(--text-muted); }
    .notif-message { color: var(--text-primary); font-size: 14px; margin: 0 0 8px; }
    .notif-footer { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class ExamScheduleComponent {
  private activatedRoute = inject(ActivatedRoute);
  private examService = inject(ExamService);
  readonly authService = inject(AuthService);

  exam = this.examService.getExamById(Number(this.activatedRoute.snapshot.paramMap.get('id')));
  schedules = this.exam ? this.examService.getSchedulesByExamId(this.exam.id) : [];
  notifications = this.exam ? this.examService.getNotificationsByExamId(this.exam.id) : [];

  showAddForm = false;

  newSchedule: Omit<ExamSchedule, 'id'> = {
    examId: this.exam?.id ?? 0,
    subject: '', date: '', startTime: '09:00', endTime: '12:00',
    room: '', maxMarks: 100, passingMarks: 35,
  };

  addScheduleEntry(): void {
    if (this.newSchedule.subject && this.newSchedule.date && this.newSchedule.room) {
      this.examService.addSchedule(this.newSchedule);
      this.schedules = this.examService.getSchedulesByExamId(this.exam!.id);
      this.newSchedule = {
        examId: this.exam!.id,
        subject: '', date: '', startTime: '09:00', endTime: '12:00',
        room: '', maxMarks: 100, passingMarks: 35,
      };
      this.showAddForm = false;
    }
  }

  deleteScheduleEntry(id: number): void {
    if (confirm('Remove this subject from the schedule?')) {
      this.examService.deleteSchedule(id);
      this.schedules = this.examService.getSchedulesByExamId(this.exam!.id);
    }
  }

  getQuestionCount(scheduleId: number): number {
    return this.examService.getQuestionsByScheduleId(scheduleId).length;
  }

  getSubmission(scheduleId: number) {
    const user = this.authService.user();
    if (!user) return undefined;
    return this.examService.getSubmissionByStudentAndSchedule(user.id, scheduleId);
  }
}
