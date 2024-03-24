import { CharacteristicValue, Service } from 'homebridge';
import API from '../api';
import { TrioEPlatform } from '../platform';
import { debounce } from 'lodash';
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

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onGet(() => (VOLUME / volumeMax) * 100)
    .onSet(
      debounce(async (value: CharacteristicValue) => {
        VOLUME = ((value as number) * volumeMax) / 100;

        if (VOLUME > 0) {
          console.log(`Fill by volume at ${VOLUME}`);
          await api.postBathtubFill(getTemperature(), VOLUME);
          removeInterval();
          CURRENT_INTERVAL = setInterval(async () => {
            const res = await api.getState();
            if (res.state === 'a' && CURRENT_INTERVAL) {
              removeInterval();
              service.setCharacteristic(platform.Characteristic.Brightness, 0);
            }
          }, 1000);
        } else {
          console.log('Stop filling by volume');
          await api.postTlc(getTemperature(), 0, false);
          removeInterval();
        }
      }, 500),
    );

  service
    .getCharacteristic(platform.Characteristic.On)
    .onSet(async (value: CharacteristicValue) => {
      service.setCharacteristic(
        platform.Characteristic.Brightness,
        (value as boolean) ? 100 : 0,
      );
    });
};

const removeInterval = () => {
  if (CURRENT_INTERVAL) {
    clearInterval(CURRENT_INTERVAL);
    CURRENT_INTERVAL = null;
  }
};
