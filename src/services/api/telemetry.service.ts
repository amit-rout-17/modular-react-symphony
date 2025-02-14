import { httpService } from "./http.service";

export class TelemetryService {
  private static instance: TelemetryService;

  private constructor() {}

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public async getUserTelemetry(orgId: string, token: string): Promise<any> {
    return httpService.request("user/telemetry", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Org-Id": orgId,
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
    });
  }

  public async getDeviceBindings(orgId: string, token: string): Promise<any> {
    return httpService.request("device/bindings", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Org-Id": orgId,
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      params: {
        active: true,
      },
    });
  }
}

export const telemetryService = TelemetryService.getInstance();
