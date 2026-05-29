export interface Driver {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  licenseNumber: string;
  experience: number;
  address: string;
  status: 'active' | 'inactive';
}

export interface Vehicle {
  id: number;
  vehicleNumber: string;
  type: 'bus' | 'van' | 'minibus';
  capacity: number;
  driverId: number;
  routeId: number;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface TransportRoute {
  id: number;
  routeName: string;
  routeNumber: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  estimatedTime: string;
  monthlyFee: number;
  status: 'active' | 'inactive';
}

export interface StudentTransport {
  studentId: number;
  routeId: number;
  pickupStop: string;
  dropStop: string;
}
