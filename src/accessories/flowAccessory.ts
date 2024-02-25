import { CharacteristicValue, Service } from 'homebridge';
import { TrioEPlatform } from '../platform';
import { getFlow, getTemperature, setFlow } from '../state';
import API from '../api';

let CURRENT_INTERVAL: NodeJS.Timeout | null = null;

export const register = (service: Service, platform: TrioEPlatform) => {
  const api = new API(
    1,
    platform.config.ip,
    platform.config.secure ? 'https' : 'http',
  );

  service.setCharacteristic(platform.Characteristic.Name, 'Flow');

  service
    .getCharacteristic(platform.Characteristic.Brightness)
    .onGet(getFlow)
    .onSet((value: CharacteristicValue) => setFlow(value as number));

  service
    .getCharacteristic(platform.Characteristic.On)
    .onGet(() => getFlow() > 0)
    .onSet(async (value: CharacteristicValue) => {
      if (value) {
        if (getFlow() === 0) {
          setFlow(100);
        }

        await api.postQuick();
        await api.postTlc(getTemperature(), getFlow(), true);
        CURRENT_INTERVAL = setInterval(api.getState, 1);
      } else {
        setFlow(0);

        await api.postTlc(getTemperature(), getFlow(), false);
        if (CURRENT_INTERVAL) {
          clearInterval(CURRENT_INTERVAL);
          CURRENT_INTERVAL = null;
        }
      }
    });
};
