import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TransportService } from '../../shared/services/transport.service';
import { TransportRoute } from '../../shared/models/transport.model';

@Component({
  selector: 'app-transport-form',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="transport-form">
      <a routerLink="/transport" class="back-link">← Back to Transport</a>
      <h1>{{ isEdit ? 'Edit Route' : 'Add New Route' }}</h1>

      <form (ngSubmit)="onSubmit()" class="form-card">
        <div class="form-grid">
          <div class="form-group">
            <label>Route Name *</label>
            <input type="text" [(ngModel)]="formData.routeName" name="routeName" required placeholder="e.g. North Route" />
          </div>
          <div class="form-group">
            <label>Route Number *</label>
            <input type="text" [(ngModel)]="formData.routeNumber" name="routeNumber" required placeholder="e.g. R-004" />
          </div>
          <div class="form-group">
            <label>Start Point *</label>
            <input type="text" [(ngModel)]="formData.startPoint" name="startPoint" required placeholder="e.g. School" />
          </div>
          <div class="form-group">
            <label>End Point *</label>
            <input type="text" [(ngModel)]="formData.endPoint" name="endPoint" required placeholder="e.g. Green Park" />
          </div>
          <div class="form-group">
            <label>Estimated Time *</label>
            <input type="text" [(ngModel)]="formData.estimatedTime" name="estimatedTime" required placeholder="e.g. 45 min" />
          </div>
          <div class="form-group">
            <label>Monthly Fee *</label>
            <input type="number" [(ngModel)]="formData.monthlyFee" name="monthlyFee" required />
          </div>
          <div class="form-group">
            <label>Status</label>
            <select [(ngModel)]="formData.status" name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Stops (comma-separated) *</label>
          <input type="text" [(ngModel)]="stopsInput" name="stops" required placeholder="School, Stop 1, Stop 2, End Point" />
        </div>

        <div class="form-actions">
          <a routerLink="/transport" class="btn-cancel">Cancel</a>
          <button type="submit" class="btn-primary">{{ isEdit ? 'Update Route' : 'Create Route' }}</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    h1 { color: #1a237e; margin: 12px 0 20px; }
    .form-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group.full-width { margin-bottom: 16px; }
    label { font-size: 13px; font-weight: 600; color: #333; }
    input, select { padding: 10px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; }
    input:focus, select:focus { outline: none; border-color: #1a237e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .btn-cancel { padding: 10px 24px; border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #666; font-weight: 500; display: flex; align-items: center; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
  `]
})
export class TransportFormComponent {
  private transportService = inject(TransportService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  isEdit = false;
  editId = 0;
  stopsInput = '';

  formData: Omit<TransportRoute, 'id'> = {
    routeName: '', routeNumber: '', startPoint: '', endPoint: '',
    stops: [], estimatedTime: '', monthlyFee: 0, status: 'active',
  };

  constructor() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = Number(id);
      const route = this.transportService.getRouteById(this.editId);
      if (route) {
        this.formData = { ...route };
        this.stopsInput = route.stops.join(', ');
      }
    }
  }

  onSubmit(): void {
    this.formData.stops = this.stopsInput.split(',').map(s => s.trim()).filter(s => s);
    if (this.isEdit) {
      this.transportService.updateRoute(this.editId, this.formData);
    } else {
      this.transportService.addRoute(this.formData);
    }
    this.router.navigate(['/transport']);
  }
}
