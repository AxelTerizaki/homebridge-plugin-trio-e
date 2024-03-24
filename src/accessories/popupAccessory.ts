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
    .getCharacteristic(platform.Characteristic.CurrentPosition)
    .onGet(async () => {
      const res = await api.getPopup();
      return res.state === 1 ? 100 : 0;
    });

  service
    .getCharacteristic(platform.Characteristic.TargetPosition)
    .onGet(async () => {
      const res = await api.getPopup();
      return res.state === 1 ? 100 : 0;
    })
    .onSet(async (value: CharacteristicValue) => {
      switch (value as number) {
        case 0:
          console.log('Close popup');
          await api.postPopup(false);
          break;
        case 100:
          console.log('Open popup');
          await api.postPopup(true);
          break;
        default:
          console.log('Close popup');
          await api.postPopup(false);
          break;
      }
    });

  service
    .getCharacteristic(platform.Characteristic.PositionState)
    .onGet(() => platform.Characteristic.PositionState.STOPPED);
};
