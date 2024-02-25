import { CharacteristicValue, Service } from 'homebridge';
import API from '../api';
import { TrioEPlatform } from '../platform';
import { getTemperature } from '../state';

let CURRENT_INTERVAL: NodeJS.Timeout | null = null;
let VOLUME = 0;

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );
  const volumeMax = platform.config.volume || 200;

  service.setCharacteristic(platform.Characteristic.Name, 'Fill by volume');

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onGet(() => (VOLUME * volumeMax) / 100)
    .onSet(
      (value: CharacteristicValue) =>
        (VOLUME = (value as number) / volumeMax / 100),
    );

  service
    .getCharacteristic(platform.Characteristic.On)
    .onGet(() => VOLUME > 0)
    .onSet(async (value: CharacteristicValue) => {
      if (value) {
        if (VOLUME === 0) {
          VOLUME = volumeMax;
        }

        await api.postBathtubFill(getTemperature(), VOLUME);
        CURRENT_INTERVAL = setInterval(async () => {
          const res = await api.getState();
          if (res.state === 'a' && CURRENT_INTERVAL) {
            clearInterval(CURRENT_INTERVAL);
            CURRENT_INTERVAL = null;
          }
        }, 1);
      } else {
        VOLUME = 0;

        await api.postTlc(getTemperature(), 0, false);
        if (CURRENT_INTERVAL) {
          clearInterval(CURRENT_INTERVAL);
          CURRENT_INTERVAL = null;
        }
      }
    });
};
