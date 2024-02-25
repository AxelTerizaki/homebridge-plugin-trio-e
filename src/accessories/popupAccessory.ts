import { CharacteristicValue, Service } from 'homebridge';
import API from '../api';
import { TrioEPlatform } from '../platform';

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );

  service
    .getCharacteristic(platform.Characteristic.On)
    .onGet(async () => {
      const res = await api.getPopup();
      return res.state === 1;
    })
    .onSet((value: CharacteristicValue) => {
      api.postPopup(value as boolean);
    });
};
