import API from '../api';
import { Service } from 'homebridge';
import { TrioEPlatform } from '../platform';

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );

  const getState = async () => {
    const res = await api.getState();
    return res.state !== 'a';
  };

  service
    .getCharacteristic(platform.Characteristic.ContactSensorState)
    .onGet(async () => await getState());

  setInterval(async () => {
    const leak = await getState();
    service.setCharacteristic(platform.Characteristic.ContactSensorState, leak);
  }, 30000);
};
