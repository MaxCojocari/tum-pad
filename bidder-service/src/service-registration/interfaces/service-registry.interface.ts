import { Observable } from 'rxjs';

interface ServiceInfo {
  serviceName: string;
  host: string;
  port: number;
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

export interface ServiceRegistryGrpc {
  register(request: ServiceInfo): Observable<RegisterResponse>;
}
