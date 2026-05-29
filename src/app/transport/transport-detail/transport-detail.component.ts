import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { TransportService } from '../../shared/services/transport.service';
import { StudentService } from '../../shared/services/student.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-transport-detail',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  template: `
    <div class="transport-detail">
      <a routerLink="/transport" class="back-link">← Back to Transport</a>

      @if (route) {
        <div class="page-header">
          <h1>{{ route.routeName }}</h1>
          @if (authService.hasRole('admin')) {
            <a [routerLink]="['/transport', route.id, 'edit']" class="btn-primary">Edit Route</a>
          }
        </div>

        <div class="detail-grid">
          <div class="detail-card">
            <h3>Route Information</h3>
            <div class="info-row"><span class="label">Route Number</span><span class="value">{{ route.routeNumber }}</span></div>
            <div class="info-row"><span class="label">Start Point</span><span class="value">{{ route.startPoint }}</span></div>
            <div class="info-row"><span class="label">End Point</span><span class="value">{{ route.endPoint }}</span></div>
            <div class="info-row"><span class="label">Estimated Time</span><span class="value">{{ route.estimatedTime }}</span></div>
            <div class="info-row"><span class="label">Monthly Fee</span><span class="value">{{ route.monthlyFee | currency }}</span></div>
            <div class="info-row"><span class="label">Status</span><span class="value"><span class="status-badge" [class]="route.status">{{ route.status }}</span></span></div>
          </div>

          <div class="detail-card">
            <h3>Stops</h3>
            <div class="stops-list">
              @for (stop of route.stops; track stop; let i = $index) {
                <div class="stop-item">
                  <span class="stop-number">{{ i + 1 }}</span>
                  <span class="stop-name">{{ stop }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="detail-grid">
          @if (vehicle) {
            <div class="detail-card">
              <h3>Vehicle Details</h3>
              <div class="info-row"><span class="label">Vehicle Number</span><span class="value">{{ vehicle.vehicleNumber }}</span></div>
              <div class="info-row"><span class="label">Type</span><span class="value capitalize">{{ vehicle.type }}</span></div>
              <div class="info-row"><span class="label">Capacity</span><span class="value">{{ vehicle.capacity }} seats</span></div>
              <div class="info-row"><span class="label">Status</span><span class="value"><span class="status-badge" [class]="vehicle.status">{{ vehicle.status }}</span></span></div>
            </div>
          }

          @if (driver) {
            <div class="detail-card">
              <h3>Driver Information</h3>
              <div class="info-row"><span class="label">Name</span><span class="value">{{ driver.firstName }} {{ driver.lastName }}</span></div>
              <div class="info-row"><span class="label">Phone</span><span class="value">{{ driver.phone }}</span></div>
              <div class="info-row"><span class="label">License #</span><span class="value">{{ driver.licenseNumber }}</span></div>
              <div class="info-row"><span class="label">Experience</span><span class="value">{{ driver.experience }} years</span></div>
              <div class="info-row"><span class="label">Address</span><span class="value">{{ driver.address }}</span></div>
            </div>
          }
        </div>

        @if (studentsOnRoute.length > 0) {
          <div class="detail-card full-width">
            <h3>Students on This Route</h3>
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Pickup Stop</th>
                  <th>Drop Stop</th>
                </tr>
              </thead>
              <tbody>
                @for (item of studentsOnRoute; track item.student.id) {
                  <tr>
                    <td>{{ item.student.rollNumber }}</td>
                    <td>{{ item.student.firstName }} {{ item.student.lastName }}</td>
                    <td>{{ item.student.class }}</td>
                    <td>{{ item.student.section }}</td>
                    <td>{{ item.pickup }}</td>
                    <td>{{ item.drop }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      } @else {
        <p class="no-data">Route not found</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 12px 0 20px; }
    .page-header h1 { margin: 0; color: var(--primary); }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .detail-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 20px; box-shadow: var(--card-shadow); }
    .detail-card.full-width { grid-column: 1 / -1; }
    .detail-card h3 { margin: 0 0 16px; color: var(--primary); font-size: 16px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
    .label { color: var(--text-secondary); font-size: 14px; }
    .value { font-weight: 600; font-size: 14px; }
    .capitalize { text-transform: capitalize; }
    .stops-list { display: flex; flex-direction: column; gap: 8px; }
    .stop-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #f8fafc; border-radius: 10px; }
    .stop-number { width: 28px; height: 28px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
    .stop-name { font-weight: 600; }
    .status-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
    .status-badge.active { background: var(--success-bg); color: var(--success-dark); }
    .status-badge.inactive { background: var(--danger-bg); color: var(--danger); }
    .status-badge.maintenance { background: var(--warning-bg); color: var(--accent-dark); }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 10px 14px; text-align: left; font-size: 13px; color: #fff; text-transform: uppercase; border: 1px solid #4338ca; }
    td { padding: 14px 16px; border: 1px solid var(--border-color); font-size: 14px; }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; }
  `]
})
export class TransportDetailComponent {
  private activatedRoute = inject(ActivatedRoute);
  private transportService = inject(TransportService);
  private studentService = inject(StudentService);
  readonly authService = inject(AuthService);

  route = this.transportService.getRouteById(Number(this.activatedRoute.snapshot.paramMap.get('id')));
  vehicle = this.route ? this.transportService.getVehicleForRoute(this.route.id) : undefined;
  driver = this.route ? this.transportService.getDriverForRoute(this.route.id) : undefined;

  get studentsOnRoute(): { student: any; pickup: string; drop: string }[] {
    if (!this.route) return [];
    return this.transportService.studentTransports()
      .filter(st => st.routeId === this.route!.id)
      .map(st => {
        const student = this.studentService.getStudentById(st.studentId);
        return student ? { student, pickup: st.pickupStop, drop: st.dropStop } : null;
      })
      .filter((item): item is { student: any; pickup: string; drop: string } => item !== null);
  }
}
