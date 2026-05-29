import { Injectable, signal, computed } from '@angular/core';
import { Driver, Vehicle, TransportRoute, StudentTransport } from '../models/transport.model';

@Injectable({ providedIn: 'root' })
export class TransportService {
  private driversData = signal<Driver[]>([
    { id: 1, firstName: 'Rajesh', lastName: 'Kumar', phone: '555-3001', licenseNumber: 'DL-2020-001234', experience: 8, address: '12 Transport Nagar', status: 'active' },
    { id: 2, firstName: 'Suresh', lastName: 'Patel', phone: '555-3002', licenseNumber: 'DL-2018-005678', experience: 12, address: '45 Main Road', status: 'active' },
    { id: 3, firstName: 'Amit', lastName: 'Singh', phone: '555-3003', licenseNumber: 'DL-2019-009012', experience: 6, address: '78 Park Avenue', status: 'active' },
    { id: 4, firstName: 'Vijay', lastName: 'Sharma', phone: '555-3004', licenseNumber: 'DL-2021-003456', experience: 4, address: '23 Lake View', status: 'inactive' },
  ]);

  private vehiclesData = signal<Vehicle[]>([
    { id: 1, vehicleNumber: 'SCH-BUS-001', type: 'bus', capacity: 40, driverId: 1, routeId: 1, status: 'active' },
    { id: 2, vehicleNumber: 'SCH-BUS-002', type: 'bus', capacity: 40, driverId: 2, routeId: 2, status: 'active' },
    { id: 3, vehicleNumber: 'SCH-VAN-001', type: 'van', capacity: 15, driverId: 3, routeId: 3, status: 'active' },
    { id: 4, vehicleNumber: 'SCH-BUS-003', type: 'bus', capacity: 40, driverId: 4, routeId: 0, status: 'maintenance' },
  ]);

  private routesData = signal<TransportRoute[]>([
    { id: 1, routeName: 'North Route', routeNumber: 'R-001', startPoint: 'School', endPoint: 'Green Park', stops: ['School', 'Elm Street', 'Oak Avenue', 'Pine Road', 'Green Park'], estimatedTime: '45 min', monthlyFee: 150, status: 'active' },
    { id: 2, routeName: 'South Route', routeNumber: 'R-002', startPoint: 'School', endPoint: 'Lake View', stops: ['School', 'Maple Lane', 'Birch Drive', 'Cedar Court', 'Lake View'], estimatedTime: '50 min', monthlyFee: 160, status: 'active' },
    { id: 3, routeName: 'East Route', routeNumber: 'R-003', startPoint: 'School', endPoint: 'Walnut Square', stops: ['School', 'Spruce Way', 'Walnut Street', 'Walnut Square'], estimatedTime: '35 min', monthlyFee: 130, status: 'active' },
  ]);

  private studentTransportData = signal<StudentTransport[]>([
    { studentId: 1, routeId: 1, pickupStop: 'Elm Street', dropStop: 'Elm Street' },
    { studentId: 2, routeId: 1, pickupStop: 'Oak Avenue', dropStop: 'Oak Avenue' },
    { studentId: 3, routeId: 2, pickupStop: 'Birch Drive', dropStop: 'Birch Drive' },
    { studentId: 5, routeId: 2, pickupStop: 'Cedar Court', dropStop: 'Cedar Court' },
    { studentId: 6, routeId: 3, pickupStop: 'Walnut Street', dropStop: 'Walnut Street' },
  ]);

  readonly drivers = this.driversData.asReadonly();
  readonly vehicles = this.vehiclesData.asReadonly();
  readonly routes = this.routesData.asReadonly();
  readonly studentTransports = this.studentTransportData.asReadonly();

  readonly totalActiveRoutes = computed(() => this.routesData().filter(r => r.status === 'active').length);
  readonly totalActiveVehicles = computed(() => this.vehiclesData().filter(v => v.status === 'active').length);
  readonly totalActiveDrivers = computed(() => this.driversData().filter(d => d.status === 'active').length);
  readonly totalStudentsUsingTransport = computed(() => this.studentTransportData().length);

  getDriverById(id: number): Driver | undefined {
    return this.driversData().find(d => d.id === id);
  }

  getVehicleById(id: number): Vehicle | undefined {
    return this.vehiclesData().find(v => v.id === id);
  }

  getRouteById(id: number): TransportRoute | undefined {
    return this.routesData().find(r => r.id === id);
  }

  getDriverForRoute(routeId: number): Driver | undefined {
    const vehicle = this.vehiclesData().find(v => v.routeId === routeId && v.status === 'active');
    if (!vehicle) return undefined;
    return this.driversData().find(d => d.id === vehicle.driverId);
  }

  getVehicleForRoute(routeId: number): Vehicle | undefined {
    return this.vehiclesData().find(v => v.routeId === routeId && v.status === 'active');
  }

  getStudentTransport(studentId: number): StudentTransport | undefined {
    return this.studentTransportData().find(st => st.studentId === studentId);
  }

  addRoute(route: Omit<TransportRoute, 'id'>): void {
    const newId = Math.max(...this.routesData().map(r => r.id), 0) + 1;
    this.routesData.update(routes => [...routes, { ...route, id: newId }]);
  }

  updateRoute(id: number, updates: Partial<TransportRoute>): void {
    this.routesData.update(routes => routes.map(r => r.id === id ? { ...r, ...updates } : r));
  }

  deleteRoute(id: number): void {
    this.routesData.update(routes => routes.filter(r => r.id !== id));
  }

  addDriver(driver: Omit<Driver, 'id'>): void {
    const newId = Math.max(...this.driversData().map(d => d.id), 0) + 1;
    this.driversData.update(drivers => [...drivers, { ...driver, id: newId }]);
  }

  updateDriver(id: number, updates: Partial<Driver>): void {
    this.driversData.update(drivers => drivers.map(d => d.id === id ? { ...d, ...updates } : d));
  }

  addVehicle(vehicle: Omit<Vehicle, 'id'>): void {
    const newId = Math.max(...this.vehiclesData().map(v => v.id), 0) + 1;
    this.vehiclesData.update(vehicles => [...vehicles, { ...vehicle, id: newId }]);
  }

  assignStudentToRoute(assignment: StudentTransport): void {
    this.studentTransportData.update(data => {
      const filtered = data.filter(st => st.studentId !== assignment.studentId);
      return [...filtered, assignment];
    });
  }
}
