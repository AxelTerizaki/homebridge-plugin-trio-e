import { CharacteristicValue, Service } from 'homebridge';
import { getTemperature, setTemperature } from '../state';
import { TrioEPlatform } from '../platform';

export const register = (service: Service, platform: TrioEPlatform) => {
  const temperatureCharacteristic = service
    .getCharacteristic(platform.Characteristic.TargetTemperature)
    .onGet(() => getTemperature())
    .onSet((temperature) => {
      setTemperature(temperature as number);
    });
  temperatureCharacteristic.props.minValue = 4;
  temperatureCharacteristic.props.maxValue = 80;

  service
    .getCharacteristic(platform.Characteristic.CurrentTemperature)
    .onGet(() => getTemperature());

  service
    .getCharacteristic(platform.Characteristic.TemperatureDisplayUnits)
    .onGet(() => platform.Characteristic.TemperatureDisplayUnits.CELSIUS);

  service
    .getCharacteristic(platform.Characteristic.TargetHeatingCoolingState)
    .onGet(() => platform.Characteristic.TargetHeatingCoolingState.HEAT)
    .onSet((value: CharacteristicValue) => {
      if (value !== platform.Characteristic.TargetHeaterCoolerState.HEAT) {
        service.setCharacteristic(
          platform.Characteristic.TargetHeatingCoolingState,
          platform.Characteristic.TargetHeaterCoolerState.HEAT,
        );
      }
    });

  service
    .getCharacteristic(platform.Characteristic.CurrentHeatingCoolingState)
    .onGet(() => platform.Characteristic.CurrentHeatingCoolingState.HEAT)
    .onSet((value: CharacteristicValue) => {
      if (value !== platform.Characteristic.CurrentHeatingCoolingState.HEAT) {
        service.setCharacteristic(
          platform.Characteristic.CurrentHeatingCoolingState,
          platform.Characteristic.CurrentHeatingCoolingState.HEAT,
        );
      }
    });
};
