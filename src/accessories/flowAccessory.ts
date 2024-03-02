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

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onSet(async (value: CharacteristicValue) => {
      const flow = (value as number) / 100;

      if (flow > 0) {
        console.log(`Fill by flow at ${flow}`);
        await api.postQuick();
        await api.postTlc(getTemperature(), flow, true);
        removeInterval();
        CURRENT_INTERVAL = setInterval(async () => {
          const res = await api.getState();
          if (res.state === 'a' && CURRENT_INTERVAL) {
            removeInterval();
          }
        }, 1000);
      } else {
        console.log('Stop filling by flow');
        await api.postTlc(getTemperature(), flow, false);
        removeInterval();
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

const removeInterval = () => {
  if (CURRENT_INTERVAL) {
    clearInterval(CURRENT_INTERVAL);
    CURRENT_INTERVAL = null;
  }
};
