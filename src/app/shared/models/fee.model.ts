export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial';
export type FeeType = 'tuition' | 'exam' | 'library' | 'transport' | 'lab' | 'sports' | 'other';

export interface FeeRecord {
  id: number;
  studentId: number;
  studentName: string;
  class: string;
  feeType: FeeType;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paymentDate: string;
  paymentStatus: PaymentStatus;
  receiptNumber: string;
  academicYear: string;
  remarks: string;
}

export interface FeeSummary {
  totalFees: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
}
