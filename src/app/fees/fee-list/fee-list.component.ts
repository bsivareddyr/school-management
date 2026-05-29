import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { FeeService } from '../../shared/services/fee.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-fee-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="fee-list">
      <div class="page-header">
        <h1>Fee Management</h1>
        @if (authService.hasRole('admin')) {
          <a routerLink="/fees/new" class="btn-primary">+ Add Fee Record</a>
        }
      </div>

      <div class="summary-cards">
        <div class="summary-card blue">
          <span class="summary-label">Total Fees</span>
          <span class="summary-value">{{ feeService.summary().totalFees | currency }}</span>
        </div>
        <div class="summary-card green">
          <span class="summary-label">Collected</span>
          <span class="summary-value">{{ feeService.summary().totalCollected | currency }}</span>
        </div>
        <div class="summary-card orange">
          <span class="summary-label">Pending</span>
          <span class="summary-value">{{ feeService.summary().totalPending | currency }}</span>
        </div>
        <div class="summary-card red">
          <span class="summary-label">Overdue</span>
          <span class="summary-value">{{ feeService.summary().totalOverdue | currency }}</span>
        </div>
      </div>

      <div class="filters">
        <input type="text" placeholder="Search by student name..." [(ngModel)]="searchTerm" class="search-input" />
        <select [(ngModel)]="filterStatus" class="filter-select">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="partial">Partial</option>
        </select>
        <select [(ngModel)]="filterType" class="filter-select">
          <option value="">All Types</option>
          <option value="tuition">Tuition</option>
          <option value="exam">Exam</option>
          <option value="library">Library</option>
          <option value="transport">Transport</option>
          <option value="lab">Lab</option>
          <option value="sports">Sports</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Receipt #</th>
              <th>Student</th>
              <th>Class</th>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (fee of filteredFees(); track fee.id) {
              <tr>
                <td>{{ fee.receiptNumber || '-' }}</td>
                <td class="student-name">{{ fee.studentName }}</td>
                <td>{{ fee.class }}</td>
                <td class="capitalize">{{ fee.feeType }}</td>
                <td>{{ fee.amount | currency }}</td>
                <td>{{ fee.paidAmount | currency }}</td>
                <td>{{ fee.dueDate }}</td>
                <td>
                  <span class="status-badge" [class]="fee.paymentStatus">{{ fee.paymentStatus }}</span>
                </td>
                <td>
                  <div class="actions">
                    @if (authService.hasRole('admin') && fee.paymentStatus !== 'paid') {
                      <a [routerLink]="['/fees', fee.id, 'pay']" class="btn-icon" title="Record Payment">💳</a>
                    }
                    @if (authService.hasRole('admin')) {
                      <a [routerLink]="['/fees', fee.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
                      <button class="btn-icon delete" (click)="deleteFee(fee.id)" title="Delete">🗑</button>
                    }
                  </div>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="9" class="no-data">No fee records found</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-header h1 { margin: 0; color: #1a237e; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary-card { background: #fff; border-radius: 12px; padding: 16px 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 4px; }
    .summary-card.blue { border-left: 4px solid #1565c0; }
    .summary-card.green { border-left: 4px solid #2e7d32; }
    .summary-card.orange { border-left: 4px solid #e65100; }
    .summary-card.red { border-left: 4px solid #c62828; }
    .summary-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; }
    .summary-value { font-size: 22px; font-weight: 700; color: #333; }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input, .filter-select { padding: 8px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    .search-input { flex: 1; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .student-name { font-weight: 500; color: #333; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.paid { background: #e8f5e9; color: #2e7d32; }
    .status-badge.pending { background: #fff3e0; color: #e65100; }
    .status-badge.overdue { background: #ffebee; color: #c62828; }
    .status-badge.partial { background: #e3f2fd; color: #1565c0; }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: #ffebee; }
    .no-data { text-align: center; color: #999; font-style: italic; padding: 40px !important; }
  `]
})
export class FeeListComponent {
  readonly feeService = inject(FeeService);
  readonly authService = inject(AuthService);

  searchTerm = '';
  filterStatus = '';
  filterType = '';

  readonly filteredFees = computed(() => {
    let fees = this.feeService.fees();
    const search = this.searchTerm.toLowerCase();

    if (search) {
      fees = fees.filter(f => f.studentName.toLowerCase().includes(search));
    }
    if (this.filterStatus) {
      fees = fees.filter(f => f.paymentStatus === this.filterStatus);
    }
    if (this.filterType) {
      fees = fees.filter(f => f.feeType === this.filterType);
    }
    return fees;
  });

  deleteFee(id: number): void {
    if (confirm('Are you sure you want to delete this fee record?')) {
      this.feeService.deleteFee(id);
    }
  }
}
