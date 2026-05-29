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
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    h1 { color: #1a237e; margin: 8px 0 20px; }
    .form-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { grid-column: span 2; }
    .form-group label { font-weight: 600; font-size: 13px; color: #555; }
    .form-group input, .form-group select, .form-group textarea {
      padding: 9px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: #1a237e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-primary { background: #1a237e; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #283593; }
    .btn-secondary { background: #f5f5f5; color: #333; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500; }
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
