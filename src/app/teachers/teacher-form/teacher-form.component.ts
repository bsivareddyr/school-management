import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TeacherService } from '../../shared/services/teacher.service';
import { Teacher } from '../../shared/models/teacher.model';

@Component({
  selector: 'app-teacher-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="teacher-form">
      <a routerLink="/teachers" class="back-link">← Back to Teachers</a>
      <h1>{{ isEdit ? 'Edit' : 'Add New' }} Teacher</h1>

      <form (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-grid">
          <div class="form-group">
            <label>First Name *</label>
            <input type="text" [(ngModel)]="formData.firstName" name="firstName" required />
          </div>
          <div class="form-group">
            <label>Last Name *</label>
            <input type="text" [(ngModel)]="formData.lastName" name="lastName" required />
          </div>
          <div class="form-group">
            <label>Email *</label>
            <input type="email" [(ngModel)]="formData.email" name="email" required />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="formData.phone" name="phone" />
          </div>
          <div class="form-group">
            <label>Date of Birth</label>
            <input type="date" [(ngModel)]="formData.dateOfBirth" name="dateOfBirth" />
          </div>
          <div class="form-group">
            <label>Gender</label>
            <select [(ngModel)]="formData.gender" name="gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Qualification *</label>
            <input type="text" [(ngModel)]="formData.qualification" name="qualification" required />
          </div>
          <div class="form-group">
            <label>Specialization *</label>
            <input type="text" [(ngModel)]="formData.specialization" name="specialization" required />
          </div>
          <div class="form-group">
            <label>Experience (years)</label>
            <input type="number" [(ngModel)]="formData.experience" name="experience" min="0" />
          </div>
          <div class="form-group">
            <label>Salary</label>
            <input type="number" [(ngModel)]="formData.salary" name="salary" min="0" />
          </div>
          <div class="form-group">
            <label>Joining Date</label>
            <input type="date" [(ngModel)]="formData.joiningDate" name="joiningDate" />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="formData.status" name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="form-group full-width">
            <label>Address</label>
            <textarea [(ngModel)]="formData.address" name="address" rows="2"></textarea>
          </div>
          <div class="form-group full-width">
            <label>Subjects (comma-separated)</label>
            <input type="text" [(ngModel)]="subjectsStr" name="subjects" placeholder="e.g. Mathematics, Statistics" />
          </div>
          <div class="form-group full-width">
            <label>Assigned Classes (comma-separated, e.g. 10-A, 10-B)</label>
            <input type="text" [(ngModel)]="classesStr" name="classes" placeholder="e.g. 10-A, 10-B" />
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/teachers" class="btn-secondary">Cancel</a>
          <button type="submit" class="btn-primary">{{ isEdit ? 'Update' : 'Add' }} Teacher</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    h1 { color: #1a237e; margin: 8px 0 20px; }
    .form-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-weight: 600; font-size: 13px; color: #555; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 9px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #1a237e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-primary { background: #1a237e; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #f5f5f5; color: #333; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
  `]
})
export class TeacherFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teacherService = inject(TeacherService);

  isEdit = false;
  editId = 0;
  subjectsStr = '';
  classesStr = '';

  formData: Omit<Teacher, 'id' | 'subjects' | 'assignedClasses'> & { subjects?: string[]; assignedClasses?: string[] } = {
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
    gender: 'male', address: '', qualification: '', specialization: '',
    experience: 0, joiningDate: '', salary: 0, status: 'active',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      const teacher = this.teacherService.getTeacherById(this.editId);
      if (teacher) {
        const { id: _id, ...rest } = teacher;
        this.formData = { ...rest };
        this.subjectsStr = teacher.subjects.join(', ');
        this.classesStr = teacher.assignedClasses.join(', ');
      }
    }
  }

  onSubmit(): void {
    const teacherData = {
      ...this.formData,
      subjects: this.subjectsStr.split(',').map(s => s.trim()).filter(Boolean),
      assignedClasses: this.classesStr.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (this.isEdit) {
      this.teacherService.updateTeacher(this.editId, teacherData);
    } else {
      this.teacherService.addTeacher(teacherData as Omit<Teacher, 'id'>);
    }
    this.router.navigate(['/teachers']);
  }
}
