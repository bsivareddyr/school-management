import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { TransportService } from '../../shared/services/transport.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-transport-list',
  standalone: true,
  imports: [RouterLink, FormsModule, CurrencyPipe],
  template: `
    <div class="transport-list">
      <div class="page-header">
        <h1>Transport Management</h1>
        @if (authService.hasRole('admin')) {
          <a routerLink="/transport/new" class="btn-primary">+ Add Route</a>
        }
      </div>

      <div class="stats-grid">
        <div class="stat-card gradient-blue">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Active Routes</span>
              <span class="stat-value">{{ transportService.totalActiveRoutes() }}</span>
              <span class="stat-change positive">Currently running</span>
            </div>
            <div class="stat-icon-wrap">🚌</div>
          </div>
        </div>
        <div class="stat-card gradient-green">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Active Vehicles</span>
              <span class="stat-value">{{ transportService.totalActiveVehicles() }}</span>
              <span class="stat-change positive">In service</span>
            </div>
            <div class="stat-icon-wrap">🚐</div>
          </div>
        </div>
        <div class="stat-card gradient-orange">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Active Drivers</span>
              <span class="stat-value">{{ transportService.totalActiveDrivers() }}</span>
              <span class="stat-change">On duty</span>
            </div>
            <div class="stat-icon-wrap">👤</div>
          </div>
        </div>
        <div class="stat-card gradient-purple">
          <div class="stat-card-inner">
            <div class="stat-info">
              <span class="stat-label">Students Using Transport</span>
              <span class="stat-value">{{ transportService.totalStudentsUsingTransport() }}</span>
              <span class="stat-change">Enrolled</span>
            </div>
            <div class="stat-icon-wrap">🎓</div>
          </div>
        </div>
      </div>

      <div class="section-title">
        <h2>Routes & Vehicles</h2>
        <div class="tab-buttons">
          <button [class.active]="activeTab() === 'routes'" (click)="activeTab.set('routes')">Routes</button>
          <button [class.active]="activeTab() === 'drivers'" (click)="activeTab.set('drivers')">Drivers</button>
          <button [class.active]="activeTab() === 'vehicles'" (click)="activeTab.set('vehicles')">Vehicles</button>
        </div>
      </div>

      @if (activeTab() === 'routes') {
        <div class="filter-bar">
          <div class="filter-group">
            <label>Route Name</label>
            <input type="text" [(ngModel)]="filterRouteName" placeholder="Search route..." />
          </div>
          <div class="filter-group">
            <label>Status</label>
            <select [(ngModel)]="filterRouteStatus">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="filter-group">
            <label>&nbsp;</label>
            <button class="btn-apply" (click)="applyFilters()">Apply</button>
          </div>
          <div class="filter-group">
            <label>&nbsp;</label>
            <button class="btn-reset" (click)="resetFilters()">Reset</button>
          </div>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Route #</th>
                <th>Route Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Stops</th>
                <th>Time</th>
                <th>Monthly Fee</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Status</th>
                @if (authService.hasRole('admin')) {
                  <th>Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (route of filteredRoutes(); track route.id) {
                <tr>
                  <td>{{ route.routeNumber }}</td>
                  <td>
                    <a [routerLink]="['/transport', route.id]" class="route-name">{{ route.routeName }}</a>
                  </td>
                  <td>{{ route.startPoint }}</td>
                  <td>{{ route.endPoint }}</td>
                  <td>{{ route.stops.length }}</td>
                  <td>{{ route.estimatedTime }}</td>
                  <td>{{ route.monthlyFee | currency }}</td>
                  <td>{{ getVehicleNumber(route.id) }}</td>
                  <td>{{ getDriverName(route.id) }}</td>
                  <td><span class="status-badge" [class]="route.status">{{ route.status }}</span></td>
                  @if (authService.hasRole('admin')) {
                    <td>
                      <div class="actions">
                        <a [routerLink]="['/transport', route.id]" class="btn-icon" title="View">👁</a>
                        <a [routerLink]="['/transport', route.id, 'edit']" class="btn-icon" title="Edit">✏️</a>
                        <button class="btn-icon delete" (click)="deleteRoute(route.id)" title="Delete">🗑</button>
                      </div>
                    </td>
                  }
                </tr>
              } @empty {
                <tr><td colspan="11" class="no-data">No routes found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab() === 'drivers') {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>License #</th>
                <th>Experience</th>
                <th>Address</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (driver of transportService.drivers(); track driver.id) {
                <tr>
                  <td class="driver-name">{{ driver.firstName }} {{ driver.lastName }}</td>
                  <td>{{ driver.phone }}</td>
                  <td>{{ driver.licenseNumber }}</td>
                  <td>{{ driver.experience }} yrs</td>
                  <td>{{ driver.address }}</td>
                  <td><span class="status-badge" [class]="driver.status">{{ driver.status }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="no-data">No drivers found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (activeTab() === 'vehicles') {
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Vehicle #</th>
                <th>Type</th>
                <th>Capacity</th>
                <th>Assigned Route</th>
                <th>Driver</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (vehicle of transportService.vehicles(); track vehicle.id) {
                <tr>
                  <td class="vehicle-number">{{ vehicle.vehicleNumber }}</td>
                  <td class="capitalize">{{ vehicle.type }}</td>
                  <td>{{ vehicle.capacity }} seats</td>
                  <td>{{ getRouteName(vehicle.routeId) }}</td>
                  <td>{{ getDriverNameById(vehicle.driverId) }}</td>
                  <td><span class="status-badge" [class]="vehicle.status">{{ vehicle.status }}</span></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="no-data">No vehicles found</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
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
    .gradient-purple { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: #fff; }
    .stat-card-inner { display: flex; justify-content: space-between; align-items: center; position: relative; z-index: 1; }
    .stat-info { display: flex; flex-direction: column; gap: 4px; }
    .stat-label { font-size: 13px; opacity: 0.85; font-weight: 500; }
    .stat-value { font-size: 28px; font-weight: 800; letter-spacing: -1px; }
    .stat-change { font-size: 12px; opacity: 0.7; font-weight: 500; }
    .stat-change.positive { opacity: 0.9; }
    .stat-icon-wrap {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      background: rgba(255,255,255,0.2);
      backdrop-filter: blur(4px);
    }
    .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title h2 { margin: 0; color: var(--primary); }
    .tab-buttons { display: flex; gap: 8px; }
    .tab-buttons button { padding: 8px 16px; border: 1px solid var(--primary); border-radius: 6px; background: var(--card-bg); color: var(--primary); cursor: pointer; font-weight: 600; transition: var(--transition); }
    .tab-buttons button.active { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; }
    .filter-bar {
      display: flex; gap: 16px; align-items: flex-end; margin-bottom: 20px; padding: 20px;
      background: var(--card-bg); border-radius: var(--card-radius); box-shadow: var(--card-shadow);
      border: 1px solid var(--border-color); flex-wrap: wrap;
    }
    .filter-group { display: flex; flex-direction: column; gap: 6px; }
    .filter-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .filter-group select, .filter-group input {
      padding: 10px 14px; border: 1.5px solid var(--input-border); border-radius: 8px;
      font-size: 14px; background: #fff; transition: var(--transition); min-width: 160px;
    }
    .filter-group select:focus, .filter-group input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
    .btn-apply {
      padding: 10px 28px; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #fff;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; transition: var(--transition);
    }
    .btn-apply:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }
    .btn-reset {
      padding: 10px 28px; background: #fff; color: var(--text-primary);
      border: 1.5px solid var(--input-border); border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: var(--transition);
    }
    .btn-reset:hover { border-color: var(--primary); color: var(--primary); }
    .table-container { background: var(--card-bg); border-radius: var(--card-radius); overflow: hidden; box-shadow: var(--card-shadow); border: 1px solid var(--border-color); }
    table { width: 100%; border-collapse: collapse; }
    th { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 14px 16px; text-align: left; font-size: 11px; color: #fff; text-transform: uppercase; letter-spacing: 0.7px; font-weight: 700; border: 1px solid #4338ca; }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    tbody tr:hover { background: #f8fafc; }
    .route-name, .driver-name, .vehicle-number { color: var(--primary); font-weight: 600; text-decoration: none; }
    .route-name:hover { text-decoration: underline; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.active { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive { background: var(--danger-bg); color: var(--danger); }
    .status-badge.maintenance { background: var(--warning-bg); color: var(--accent-dark); }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: var(--danger-bg); }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px !important; }
  `]
})
export class TransportListComponent {
  readonly authService = inject(AuthService);
  readonly transportService = inject(TransportService);

  activeTab = signal<'routes' | 'drivers' | 'vehicles'>('routes');
  filterRouteName = '';
  filterRouteStatus = '';

  appliedRouteName = '';
  appliedRouteStatus = '';
  filterTrigger = signal(0);

  readonly filteredRoutes = computed(() => {
    const trigger = this.filterTrigger();
    let routes = this.transportService.routes();
    if (this.appliedRouteName) {
      const name = this.appliedRouteName.toLowerCase();
      routes = routes.filter(r => r.routeName.toLowerCase().includes(name));
    }
    if (this.appliedRouteStatus) {
      routes = routes.filter(r => r.status === this.appliedRouteStatus);
    }
    return routes;
  });

  applyFilters(): void {
    this.appliedRouteName = this.filterRouteName;
    this.appliedRouteStatus = this.filterRouteStatus;
    this.filterTrigger.update(v => v + 1);
  }

  resetFilters(): void {
    this.filterRouteName = '';
    this.filterRouteStatus = '';
    this.applyFilters();
  }

  getVehicleNumber(routeId: number): string {
    const vehicle = this.transportService.getVehicleForRoute(routeId);
    return vehicle ? vehicle.vehicleNumber : '-';
  }

  getDriverName(routeId: number): string {
    const driver = this.transportService.getDriverForRoute(routeId);
    return driver ? `${driver.firstName} ${driver.lastName}` : '-';
  }

  getDriverNameById(driverId: number): string {
    const driver = this.transportService.getDriverById(driverId);
    return driver ? `${driver.firstName} ${driver.lastName}` : '-';
  }

  getRouteName(routeId: number): string {
    if (routeId === 0) return 'Unassigned';
    const route = this.transportService.getRouteById(routeId);
    return route ? route.routeName : '-';
  }

  deleteRoute(id: number): void {
    if (confirm('Are you sure you want to delete this route?')) {
      this.transportService.deleteRoute(id);
    }
  }
}
