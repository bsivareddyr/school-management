import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';
import { Exam } from '../../shared/models/exam.model';

@Component({
  selector: 'app-exam-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="exam-form">
      <a routerLink="/exams" class="back-link">← Back to Exams</a>
      <h1>{{ isEdit ? 'Edit Exam' : 'Create New Exam' }}</h1>

      <form (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-grid">
          <div class="form-group">
            <label>Exam Name *</label>
            <input type="text" [(ngModel)]="formData.name" name="name" required placeholder="e.g. Mid-Term Examination 2026" />
          </div>
          <div class="form-group">
            <label>Exam Type *</label>
            <select [(ngModel)]="formData.type" name="type" required>
              <option value="midterm">Mid-Term</option>
              <option value="final">Final</option>
              <option value="unit_test">Unit Test</option>
              <option value="quarterly">Quarterly</option>
              <option value="half_yearly">Half Yearly</option>
            </select>
          </div>
          <div class="form-group">
            <label>Class *</label>
            <select [(ngModel)]="formData.class" name="class" required>
              <option value="">Select Class</option>
              <option value="8">Class 8</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </div>
          <div class="form-group">
            <label>Section *</label>
            <select [(ngModel)]="formData.section" name="section" required>
              <option value="">Select Section</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </div>
          <div class="form-group">
            <label>Academic Year</label>
            <input type="text" [(ngModel)]="formData.academicYear" name="academicYear" placeholder="e.g. 2025-2026" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="formData.status" name="status">
              <option value="scheduled">Scheduled</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div class="form-group">
            <label>Start Date *</label>
            <input type="date" [(ngModel)]="formData.startDate" name="startDate" required />
          </div>
          <div class="form-group">
            <label>End Date *</label>
            <input type="date" [(ngModel)]="formData.endDate" name="endDate" required />
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/exams" class="btn-cancel">Cancel</a>
          <button type="submit" class="btn-primary">{{ isEdit ? 'Update Exam' : 'Create Exam' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    h1 { color: var(--primary); margin: 12px 0 20px; }
    .form-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 24px; box-shadow: var(--card-shadow); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 13px; font-weight: 700; color: var(--text-primary); }
    input, select { padding: 10px 14px; border: 1.5px solid var(--input-border); border-radius: 10px; font-size: 14px; }
    input:focus, select:focus { outline: none; border-color: var(--primary); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .btn-cancel { padding: 10px 24px; border: 1.5px solid var(--input-border); border-radius: 10px; text-decoration: none; color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 24px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; }
  `]
})
export class ExamFormComponent {
  private examService = inject(ExamService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  isEdit = false;
  editId = 0;

  formData: Omit<Exam, 'id'> = {
    name: '', type: 'midterm', class: '', section: '', academicYear: '2025-2026',
    startDate: '', endDate: '', status: 'scheduled',
    createdBy: this.authService.user()?.name ?? '', createdAt: new Date().toISOString().split('T')[0],
  };

  constructor() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      const exam = this.examService.getExamById(this.editId);
      if (exam) {
        const { id: _, ...rest } = exam;
        this.formData = { ...rest };
      }
    }
  }

  onSubmit(): void {
    if (this.isEdit) {
      this.examService.updateExam(this.editId, this.formData);
    } else {
      this.examService.addExam(this.formData);
    }
    this.router.navigate(['/exams']);
  }
}
