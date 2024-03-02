import { CharacteristicValue, Service } from 'homebridge';
import API from '../api';
import { TrioEPlatform } from '../platform';
import { getTemperature } from '../state';

let CURRENT_INTERVAL: NodeJS.Timeout | null = null;

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );
  const volumeMax = platform.config.volume || 200;

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onSet(async (value: CharacteristicValue) => {
      const volume = ((value as number) * volumeMax) / 100;

      if (volume > 0) {
        await api.postBathtubFill(getTemperature(), volume);
        CURRENT_INTERVAL = setInterval(async () => {
          const res = await api.getState();
          if (res.state === 'a' && CURRENT_INTERVAL) {
            clearInterval(CURRENT_INTERVAL);
            CURRENT_INTERVAL = null;
          }
        }, 1000);
      } else {
        await api.postTlc(getTemperature(), 0, false);
        if (CURRENT_INTERVAL) {
          clearInterval(CURRENT_INTERVAL);
          CURRENT_INTERVAL = null;
        }
      }
    });

  service
    .getCharacteristic(platform.Characteristic.On)
    .onSet(async (value: CharacteristicValue) => {
      if (!value as boolean) {
        service.setCharacteristic(platform.Characteristic.Brightness, 0);
      }
    });
};
