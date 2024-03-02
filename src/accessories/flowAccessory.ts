import { CharacteristicValue, Service } from 'homebridge';
import API from '../api';
import { TrioEPlatform } from '../platform';
import { debounce } from 'lodash';
import { getTemperature } from '../state';

let CURRENT_INTERVAL: NodeJS.Timeout | null = null;
let FLOW = 0;

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onGet(() => FLOW * 100)
    .onSet(debounce(async (value: CharacteristicValue) => {
      FLOW = (value as number) / 100;

      if (FLOW > 0) {
        console.log(`Fill by flow at ${FLOW}`);
        await api.postQuick();
        await api.postTlc(getTemperature(), FLOW, true);
        removeInterval();
        CURRENT_INTERVAL = setInterval(async () => {
          const res = await api.getState();
          if (res.state === 'a' && CURRENT_INTERVAL) {
            removeInterval();
          }
        }, 1000);
      } else {
        console.log('Stop filling by flow');
        await api.postTlc(getTemperature(), FLOW, false);
        removeInterval();
      }
    }, 500));

  service
    .getCharacteristic(platform.Characteristic.On)
    .onSet(async (value: CharacteristicValue) => {
      service.setCharacteristic(platform.Characteristic.Brightness, value as boolean ? 100 : 0);
    });
};

const removeInterval = () => {
  if (CURRENT_INTERVAL) {
    clearInterval(CURRENT_INTERVAL);
    CURRENT_INTERVAL = null;
  }
};
