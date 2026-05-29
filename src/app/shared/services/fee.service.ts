import { Injectable, signal, computed } from '@angular/core';
import { FeeRecord, FeeSummary, PaymentStatus } from '../models/fee.model';

@Injectable({ providedIn: 'root' })
export class FeeService {
  private feesData = signal<FeeRecord[]>([
    { id: 1, studentId: 1, studentName: 'Alice Johnson', class: '10', feeType: 'tuition', amount: 5000, paidAmount: 5000, dueDate: '2026-04-01', paymentDate: '2026-03-28', paymentStatus: 'paid', receiptNumber: 'RCP-001', academicYear: '2025-2026', remarks: '' },
    { id: 2, studentId: 1, studentName: 'Alice Johnson', class: '10', feeType: 'exam', amount: 500, paidAmount: 500, dueDate: '2026-05-01', paymentDate: '2026-04-25', paymentStatus: 'paid', receiptNumber: 'RCP-002', academicYear: '2025-2026', remarks: '' },
    { id: 3, studentId: 1, studentName: 'Alice Johnson', class: '10', feeType: 'library', amount: 300, paidAmount: 0, dueDate: '2026-06-01', paymentDate: '', paymentStatus: 'pending', receiptNumber: '', academicYear: '2025-2026', remarks: '' },
    { id: 4, studentId: 2, studentName: 'Bob Williams', class: '10', feeType: 'tuition', amount: 5000, paidAmount: 2500, dueDate: '2026-04-01', paymentDate: '2026-04-10', paymentStatus: 'partial', receiptNumber: 'RCP-003', academicYear: '2025-2026', remarks: 'Installment 1 of 2' },
    { id: 5, studentId: 2, studentName: 'Bob Williams', class: '10', feeType: 'transport', amount: 1200, paidAmount: 0, dueDate: '2026-03-01', paymentDate: '', paymentStatus: 'overdue', receiptNumber: '', academicYear: '2025-2026', remarks: 'Pending follow-up' },
    { id: 6, studentId: 3, studentName: 'Charlie Brown', class: '9', feeType: 'tuition', amount: 4500, paidAmount: 4500, dueDate: '2026-04-01', paymentDate: '2026-03-30', paymentStatus: 'paid', receiptNumber: 'RCP-004', academicYear: '2025-2026', remarks: '' },
    { id: 7, studentId: 3, studentName: 'Charlie Brown', class: '9', feeType: 'lab', amount: 800, paidAmount: 800, dueDate: '2026-05-01', paymentDate: '2026-04-28', paymentStatus: 'paid', receiptNumber: 'RCP-005', academicYear: '2025-2026', remarks: '' },
    { id: 8, studentId: 4, studentName: 'Diana Davis', class: '9', feeType: 'tuition', amount: 4500, paidAmount: 0, dueDate: '2026-04-01', paymentDate: '', paymentStatus: 'overdue', receiptNumber: '', academicYear: '2025-2026', remarks: 'Payment reminder sent' },
    { id: 9, studentId: 5, studentName: 'Edward Miller', class: '10', feeType: 'tuition', amount: 5000, paidAmount: 5000, dueDate: '2026-04-01', paymentDate: '2026-03-25', paymentStatus: 'paid', receiptNumber: 'RCP-006', academicYear: '2025-2026', remarks: '' },
    { id: 10, studentId: 5, studentName: 'Edward Miller', class: '10', feeType: 'sports', amount: 600, paidAmount: 600, dueDate: '2026-05-01', paymentDate: '2026-04-20', paymentStatus: 'paid', receiptNumber: 'RCP-007', academicYear: '2025-2026', remarks: '' },
    { id: 11, studentId: 6, studentName: 'Fiona Garcia', class: '8', feeType: 'tuition', amount: 4000, paidAmount: 2000, dueDate: '2026-04-01', paymentDate: '2026-04-05', paymentStatus: 'partial', receiptNumber: 'RCP-008', academicYear: '2025-2026', remarks: 'Partial payment' },
    { id: 12, studentId: 8, studentName: 'Hannah Anderson', class: '9', feeType: 'tuition', amount: 4500, paidAmount: 4500, dueDate: '2026-04-01', paymentDate: '2026-03-29', paymentStatus: 'paid', receiptNumber: 'RCP-009', academicYear: '2025-2026', remarks: '' },
  ]);

  readonly fees = this.feesData.asReadonly();

  readonly summary = computed<FeeSummary>(() => {
    const all = this.feesData();
    return {
      totalFees: all.reduce((sum, f) => sum + f.amount, 0),
      totalCollected: all.reduce((sum, f) => sum + f.paidAmount, 0),
      totalPending: all.filter(f => f.paymentStatus === 'pending').reduce((sum, f) => sum + f.amount - f.paidAmount, 0),
      totalOverdue: all.filter(f => f.paymentStatus === 'overdue').reduce((sum, f) => sum + f.amount - f.paidAmount, 0),
    };
  });

  getByStudent(studentId: number): FeeRecord[] {
    return this.feesData().filter(f => f.studentId === studentId);
  }

  getByStatus(status: PaymentStatus): FeeRecord[] {
    return this.feesData().filter(f => f.paymentStatus === status);
  }

  addFee(fee: Omit<FeeRecord, 'id'>): void {
    const newId = Math.max(...this.feesData().map(f => f.id), 0) + 1;
    this.feesData.update(fees => [...fees, { ...fee, id: newId }]);
  }

  updateFee(id: number, updates: Partial<FeeRecord>): void {
    this.feesData.update(fees =>
      fees.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  }

  recordPayment(id: number, amount: number, receiptNumber: string): void {
    this.feesData.update(fees =>
      fees.map(f => {
        if (f.id !== id) return f;
        const newPaidAmount = f.paidAmount + amount;
        const newStatus: PaymentStatus = newPaidAmount >= f.amount ? 'paid' : 'partial';
        return {
          ...f,
          paidAmount: newPaidAmount,
          paymentStatus: newStatus,
          paymentDate: new Date().toISOString().split('T')[0],
          receiptNumber,
        };
      })
    );
  }

  deleteFee(id: number): void {
    this.feesData.update(fees => fees.filter(f => f.id !== id));
  }
}
