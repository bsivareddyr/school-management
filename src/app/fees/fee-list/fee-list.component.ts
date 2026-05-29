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
    .page-header h1 { margin: 0; color: var(--primary); }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .summary-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 16px 20px; box-shadow: var(--card-shadow); display: flex; flex-direction: column; gap: 4px; }
    .summary-card.blue { border-left: 4px solid #1565c0; }
    .summary-card.green { border-left: 4px solid #2e7d32; }
    .summary-card.orange { border-left: 4px solid #e65100; }
    .summary-card.red { border-left: 4px solid #c62828; }
    .summary-label { font-size: 12px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; }
    .summary-value { font-size: 22px; font-weight: 700; color: var(--text-primary); }
    .filters { display: flex; gap: 12px; margin-bottom: 16px; }
    .search-input, .filter-select { padding: 8px 14px; border: 1.5px solid var(--input-border); border-radius: 10px; font-size: 14px; }
    .search-input { flex: 1; }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 13px; color: var(--text-secondary); text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid var(--border-color); font-size: 14px; }
    .student-name { font-weight: 600; color: var(--text-primary); }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.paid { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.pending { background: var(--warning-bg); color: var(--accent-dark); }
    .status-badge.overdue { background: var(--danger-bg); color: var(--danger); }
    .status-badge.partial { background: var(--info-bg); color: var(--info); }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
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
