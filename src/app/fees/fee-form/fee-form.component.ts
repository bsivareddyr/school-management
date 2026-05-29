import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FeeService } from '../../shared/services/fee.service';
import { StudentService } from '../../shared/services/student.service';
import { FeeRecord } from '../../shared/models/fee.model';

@Component({
  selector: 'app-fee-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="fee-form">
      <a routerLink="/fees" class="back-link">← Back to Fees</a>
      <h1>{{ isEdit ? 'Edit' : isPayment ? 'Record Payment' : 'Add New' }} Fee</h1>

      <form (ngSubmit)="onSubmit()" class="form-card">
        @if (isPayment) {
          <div class="payment-info">
            <p><strong>Student:</strong> {{ paymentFee?.studentName }}</p>
            <p><strong>Fee Type:</strong> {{ paymentFee?.feeType }}</p>
            <p><strong>Total Amount:</strong> {{ paymentFee?.amount }}</p>
            <p><strong>Already Paid:</strong> {{ paymentFee?.paidAmount }}</p>
            <p><strong>Remaining:</strong> {{ (paymentFee?.amount ?? 0) - (paymentFee?.paidAmount ?? 0) }}</p>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label>Payment Amount *</label>
              <input type="number" [(ngModel)]="paymentAmount" name="paymentAmount" required min="1" />
            </div>
            <div class="form-group">
              <label>Receipt Number *</label>
              <input type="text" [(ngModel)]="receiptNumber" name="receiptNumber" required />
            </div>
          </div>
        } @else {
          <div class="form-grid">
            <div class="form-group">
              <label>Student *</label>
              <select [(ngModel)]="formData.studentId" name="studentId" (ngModelChange)="onStudentChange()" required [disabled]="isEdit">
                <option [ngValue]="0">Select Student</option>
                @for (student of studentService.students(); track student.id) {
                  <option [ngValue]="student.id">{{ student.firstName }} {{ student.lastName }} ({{ student.class }}-{{ student.section }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label>Fee Type *</label>
              <select [(ngModel)]="formData.feeType" name="feeType" required>
                <option value="tuition">Tuition</option>
                <option value="exam">Exam</option>
                <option value="library">Library</option>
                <option value="transport">Transport</option>
                <option value="lab">Lab</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Amount *</label>
              <input type="number" [(ngModel)]="formData.amount" name="amount" required min="1" />
            </div>
            <div class="form-group">
              <label>Paid Amount</label>
              <input type="number" [(ngModel)]="formData.paidAmount" name="paidAmount" min="0" />
            </div>
            <div class="form-group">
              <label>Due Date *</label>
              <input type="date" [(ngModel)]="formData.dueDate" name="dueDate" required />
            </div>
            <div class="form-group">
              <label>Academic Year</label>
              <input type="text" [(ngModel)]="formData.academicYear" name="academicYear" placeholder="e.g. 2025-2026" />
            </div>
            <div class="form-group">
              <label>Payment Status</label>
              <select [(ngModel)]="formData.paymentStatus" name="paymentStatus">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div class="form-group">
              <label>Receipt Number</label>
              <input type="text" [(ngModel)]="formData.receiptNumber" name="receiptNumber" />
            </div>
            <div class="form-group full-width">
              <label>Remarks</label>
              <textarea [(ngModel)]="formData.remarks" name="remarks" rows="2"></textarea>
            </div>
          </div>
        }

        <div class="form-actions">
          <a routerLink="/fees" class="btn-secondary">Cancel</a>
          <button type="submit" class="btn-primary">
            {{ isPayment ? 'Record Payment' : isEdit ? 'Update' : 'Add' }} Fee
          </button>
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
    .payment-info { background: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
    .payment-info p { margin: 4px 0; font-size: 14px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    .btn-primary { background: #1a237e; color: #fff; border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-secondary { background: #f5f5f5; color: #333; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; }
  `]
})
export class FeeFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private feeService = inject(FeeService);
  readonly studentService = inject(StudentService);

  isEdit = false;
  isPayment = false;
  editId = 0;
  paymentAmount = 0;
  receiptNumber = '';
  paymentFee: FeeRecord | undefined;

  formData: Omit<FeeRecord, 'id'> = {
    studentId: 0, studentName: '', class: '', feeType: 'tuition', amount: 0,
    paidAmount: 0, dueDate: '', paymentDate: '', paymentStatus: 'pending',
    receiptNumber: '', academicYear: '2025-2026', remarks: '',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const url = this.router.url;

    if (id && url.includes('/pay')) {
      this.isPayment = true;
      this.editId = Number(id);
      this.paymentFee = this.feeService.fees().find(f => f.id === this.editId);
    } else if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      const fee = this.feeService.fees().find(f => f.id === this.editId);
      if (fee) {
        const { id: _id, ...rest } = fee;
        this.formData = { ...rest };
      }
    }
  }

  onStudentChange(): void {
    const student = this.studentService.students().find(s => s.id === this.formData.studentId);
    if (student) {
      this.formData.studentName = `${student.firstName} ${student.lastName}`;
      this.formData.class = student.class;
    }
  }

  onSubmit(): void {
    if (this.isPayment) {
      this.feeService.recordPayment(this.editId, this.paymentAmount, this.receiptNumber);
    } else if (this.isEdit) {
      this.feeService.updateFee(this.editId, this.formData);
    } else {
      this.feeService.addFee(this.formData);
    }
    this.router.navigate(['/fees']);
  }
}
