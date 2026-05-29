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

      <div class="stats-grid">
        <div class="stat-card gradient-blue">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Total Fees</span>
              <span class="stat-value">{{ feeService.summary().totalFees | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="stat-change">All fee records</span>
            </div>
            <div class="stat-icon-wrap">💵</div>
          </div>
        </div>
        <div class="stat-card gradient-green">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Collected</span>
              <span class="stat-value">{{ feeService.summary().totalCollected | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="stat-change positive">Payments received</span>
            </div>
            <div class="stat-icon-wrap">✅</div>
          </div>
        </div>
        <div class="stat-card gradient-orange">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Pending</span>
              <span class="stat-value">{{ feeService.summary().totalPending | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="stat-change">Awaiting payment</span>
            </div>
            <div class="stat-icon-wrap">⏳</div>
          </div>
        </div>
        <div class="stat-card gradient-red">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Overdue</span>
              <span class="stat-value">{{ feeService.summary().totalOverdue | currency:'USD':'symbol':'1.0-0' }}</span>
              <span class="stat-change negative">Past due date</span>
            </div>
            <div class="stat-icon-wrap">⚠️</div>
          </div>
        </div>
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
            <tr class="filter-row">
              <td></td>
              <td><input type="text" [(ngModel)]="searchTerm" placeholder="Filter..." class="th-filter" /></td>
              <td></td>
              <td>
                <select [(ngModel)]="filterType" class="th-filter">
                  <option value="">All</option>
                  <option value="tuition">Tuition</option>
                  <option value="exam">Exam</option>
                  <option value="library">Library</option>
                  <option value="transport">Transport</option>
                  <option value="lab">Lab</option>
                  <option value="sports">Sports</option>
                  <option value="other">Other</option>
                </select>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <select [(ngModel)]="filterStatus" class="th-filter">
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="partial">Partial</option>
                </select>
              </td>
              <td></td>
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
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card {
      border-radius: var(--card-radius);
      padding: 24px;
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute;
      top: 0; right: 0;
      width: 100px; height: 100px;
      border-radius: 50%;
      background: #fff;
      opacity: 0.1;
      transform: translate(30%, -30%);
    }
    .stat-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
    .gradient-blue { background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff; }
    .gradient-green { background: linear-gradient(135deg, #059669, #10b981); color: #fff; }
    .gradient-orange { background: linear-gradient(135deg, #d97706, #f59e0b); color: #fff; }
    .gradient-red { background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff; }
    .stat-card-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .stat-change { font-size: 12px; opacity: 0.7; font-weight: 500; }
    .stat-change.positive { opacity: 0.9; }
    .stat-change.negative { opacity: 0.9; }
    .stat-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
    }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 14px 16px; text-align: left; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid #4338ca; }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .filter-row td { padding: 8px 10px; background: #f1f5f9; border: 1px solid var(--border-color); }
    .th-filter { width: 100%; padding: 6px 10px; border: 1.5px solid var(--input-border); border-radius: 6px; font-size: 13px; background: #fff; transition: var(--transition); }
    .th-filter:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1); }
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
