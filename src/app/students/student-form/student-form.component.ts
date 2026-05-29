import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StudentService } from '../../shared/services/student.service';
import { Student } from '../../shared/models/student.model';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="student-form">
      <a routerLink="/students" class="back-link">← Back to Students</a>
      <h1>{{ isEdit ? 'Edit' : 'Add New' }} Student</h1>

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
            <label>Date of Birth *</label>
            <input type="date" [(ngModel)]="formData.dateOfBirth" name="dateOfBirth" required />
          </div>
          <div class="form-group">
            <label>Gender *</label>
            <select [(ngModel)]="formData.gender" name="gender" required>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>Class *</label>
            <select [(ngModel)]="formData.class" name="class" required>
              @for (cls of ['8', '9', '10', '11', '12']; track cls) {
                <option [value]="cls">Class {{ cls }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Section *</label>
            <select [(ngModel)]="formData.section" name="section" required>
              @for (sec of ['A', 'B', 'C', 'D']; track sec) {
                <option [value]="sec">{{ sec }}</option>
              }
            </select>
          </div>
          <div class="form-group">
            <label>Roll Number *</label>
            <input type="text" [(ngModel)]="formData.rollNumber" name="rollNumber" required />
          </div>
          <div class="form-group">
            <label>Admission Date *</label>
            <input type="date" [(ngModel)]="formData.admissionDate" name="admissionDate" required />
          </div>
          <div class="form-group full-width">
            <label>Address</label>
            <textarea [(ngModel)]="formData.address" name="address" rows="2"></textarea>
          </div>
          <div class="form-group">
            <label>Parent Name *</label>
            <input type="text" [(ngModel)]="formData.parentName" name="parentName" required />
          </div>
          <div class="form-group">
            <label>Parent Phone *</label>
            <input type="text" [(ngModel)]="formData.parentPhone" name="parentPhone" required />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="formData.status" name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div class="form-actions">
          <a routerLink="/students" class="btn-secondary">Cancel</a>
          <button type="submit" class="btn-primary">{{ isEdit ? 'Update' : 'Add' }} Student</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; font-weight: 500; }
    h1 { color: var(--text-primary); margin: 8px 0 24px; font-weight: 800; letter-spacing: -0.5px; }
    .form-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 28px; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-weight: 600; font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.3px; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 10px 14px;
      border: 1.5px solid var(--input-border);
      border-radius: var(--input-radius);
      font-size: 14px;
      background: #f8fafc;
      transition: var(--transition);
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border: none; padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-secondary { background: #f1f5f9; color: var(--text-secondary); padding: 10px 24px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600; transition: var(--transition); border: 1px solid var(--border-color); }
    .btn-secondary:hover { background: #e2e8f0; }
  `]
})
export class StudentFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private studentService = inject(StudentService);

  isEdit = false;
  editId = 0;

  formData: Omit<Student, 'id'> = {
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
    gender: 'male', address: '', class: '10', section: 'A', rollNumber: '',
    admissionDate: '', parentName: '', parentPhone: '', status: 'active',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      const student = this.studentService.getStudentById(this.editId);
      if (student) {
        const { id: _id, ...rest } = student;
        this.formData = { ...rest };
      }
    }
  }

  onSubmit(): void {
    if (this.isEdit) {
      this.studentService.updateStudent(this.editId, this.formData);
    } else {
      this.studentService.addStudent(this.formData);
    }
    this.router.navigate(['/students']);
  }
}
