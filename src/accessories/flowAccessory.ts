import { CharacteristicValue, Service } from 'homebridge';
import API from '../api';
import { TrioEPlatform } from '../platform';
import { getTemperature } from '../state';

let CURRENT_INTERVAL: NodeJS.Timeout | null = null;
let FLOW: number = 0;

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );

  service.setCharacteristic(platform.Characteristic.Name, 'Fill by flow');

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onGet(() => FLOW * 100)
    .onSet((value: CharacteristicValue) => (FLOW = (value as number) / 100));

  service
    .getCharacteristic(platform.Characteristic.On)
    .onGet(() => FLOW > 0)
    .onSet(async (value: CharacteristicValue) => {
      if (value) {
        if (FLOW === 0) {
          FLOW = 1;
        }

        await api.postQuick();
        await api.postTlc(getTemperature(), FLOW / 100, true);
        CURRENT_INTERVAL = setInterval(async () => {
          const res = await api.getState();
          if (res.state === 'a' && CURRENT_INTERVAL) {
            clearInterval(CURRENT_INTERVAL);
            CURRENT_INTERVAL = null;
          }
        }, 1);
      } else {
        FLOW = 0;

        await api.postTlc(getTemperature(), FLOW / 100, false);
        if (CURRENT_INTERVAL) {
          clearInterval(CURRENT_INTERVAL);
          CURRENT_INTERVAL = null;
        }
      }
    });
};
