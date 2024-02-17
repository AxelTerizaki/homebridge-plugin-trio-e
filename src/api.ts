import axios, { AxiosInstance } from 'axios';
import { Agent } from 'https';

class API {
  deviceId: number;
  axiosApi: AxiosInstance;

  constructor(
    deviceId: number,
    deviceIp: string,
    protocol: 'http' | 'https' = 'http',
  ) {
    this.deviceId = deviceId;
    this.axiosApi = axios.create({
      baseURL: `${protocol}://${deviceIp}/api`,
      httpsAgent: new Agent({ rejectUnauthorized: false }),
    });
  }

  async getTlc() {
    const res = await this.axiosApi.get(`/tlc/${this.deviceId}/`);
    return res.data;
  }

  async getQuick() {
    const res = await this.axiosApi.get(
      `/tlc/${this.deviceId}/quick/${this.deviceId}/`,
    );
    return res.data;
  }

  async getSettings() {
    const res = await this.axiosApi.get(`/tlc/${this.deviceId}/settings/`);
    return res.data;
  }

  async getState() {
    const res = await this.axiosApi.get(`/tlc/${this.deviceId}/state/`);
    return res.data;
  }

  async getPopup() {
    const res = await this.axiosApi.get(`/tlc/${this.deviceId}/popup/`);
    return res.data;
  }

  async postPopup(state: boolean) {
    const res = await this.axiosApi.post(
      `/tlc/${this.deviceId}/popup/`,
      { state: state ? 1 : 0 },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return res.data;
  }

  async postQuick() {
    const res = await this.axiosApi.post(
      `/tlc/${this.deviceId}/quick/${this.deviceId}/`,
      { data: 1 },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return res.data;
  }

  async postBathtubFill(temperature: number, amount: number) {
    const res = await this.axiosApi.post(
      `/tlc/${this.deviceId}/bathtub-fill/`,
      { temperature, amount },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return res.data;
  }

  async postTlc(temperature: number, flow: number, changed: boolean) {
    const res = await this.axiosApi.post(
      `/tlc/${this.deviceId}/`,
      { temperature, flow, changed: changed ? 1 : 0 },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return res.data;
  }
}

export default API;
