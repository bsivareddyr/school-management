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
        <div class="stat-card blue">
          <span class="stat-icon">🚌</span>
          <div class="stat-info">
            <span class="stat-value">{{ transportService.totalActiveRoutes() }}</span>
            <span class="stat-label">Active Routes</span>
          </div>
        </div>
        <div class="stat-card green">
          <span class="stat-icon">🚐</span>
          <div class="stat-info">
            <span class="stat-value">{{ transportService.totalActiveVehicles() }}</span>
            <span class="stat-label">Active Vehicles</span>
          </div>
        </div>
        <div class="stat-card orange">
          <span class="stat-icon">👤</span>
          <div class="stat-info">
            <span class="stat-value">{{ transportService.totalActiveDrivers() }}</span>
            <span class="stat-label">Active Drivers</span>
          </div>
        </div>
        <div class="stat-card purple">
          <span class="stat-icon">🎓</span>
          <div class="stat-info">
            <span class="stat-value">{{ transportService.totalStudentsUsingTransport() }}</span>
            <span class="stat-label">Students Using Transport</span>
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
              @for (route of transportService.routes(); track route.id) {
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
    .page-header h1 { margin: 0; color: #1a237e; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .stat-card { background: #fff; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .stat-card.blue { border-left: 4px solid #1565c0; }
    .stat-card.green { border-left: 4px solid #2e7d32; }
    .stat-card.orange { border-left: 4px solid #e65100; }
    .stat-card.purple { border-left: 4px solid #6a1b9a; }
    .stat-icon { font-size: 32px; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 24px; font-weight: 700; color: #333; }
    .stat-label { font-size: 12px; color: #666; }
    .section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-title h2 { margin: 0; color: #1a237e; }
    .tab-buttons { display: flex; gap: 8px; }
    .tab-buttons button { padding: 8px 16px; border: 1px solid #1a237e; border-radius: 6px; background: #fff; color: #1a237e; cursor: pointer; font-weight: 500; }
    .tab-buttons button.active { background: #1a237e; color: #fff; }
    .table-container { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-size: 13px; color: #666; text-transform: uppercase; }
    td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .route-name, .driver-name, .vehicle-number { color: #1a237e; font-weight: 500; text-decoration: none; }
    .route-name:hover { text-decoration: underline; }
    .capitalize { text-transform: capitalize; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 600; text-transform: capitalize; }
    .status-badge.active { background: #e8f5e9; color: #2e7d32; }
    .status-badge.inactive { background: #ffebee; color: #c62828; }
    .status-badge.maintenance { background: #fff3e0; color: #e65100; }
    .actions { display: flex; gap: 4px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; text-decoration: none; }
    .btn-icon:hover { background: #f0f0f0; }
    .btn-icon.delete:hover { background: #ffebee; }
    .no-data { text-align: center; color: #999; font-style: italic; padding: 40px !important; }
  `]
})
export class TransportListComponent {
  readonly authService = inject(AuthService);
  readonly transportService = inject(TransportService);

  activeTab = signal<'routes' | 'drivers' | 'vehicles'>('routes');

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
