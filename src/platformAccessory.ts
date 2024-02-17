import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { TrioEPlatform } from './platform';
import API from './api';

export class TrioEPlatformAccessory {
  private popupService: Service;
  private thermostatService: Service;
  private flowService: Service;
  private API: API;

  private state = {
    Flow: 1,
    Temperature: 38,
  };

  constructor(
    private readonly platform: TrioEPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.API = new API(
      1,
      this.platform.config.ip,
      this.platform.config.secure ? 'https' : 'http',
    );

    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Viega')
      .setCharacteristic(this.platform.Characteristic.Model, 'Multiplex Trio E')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'ABCDEFGH')
      .setCharacteristic(this.platform.Characteristic.ValveType, 3);

    this.popupService =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);
    this.popupService.setCharacteristic(
      this.platform.Characteristic.Name,
      'Popup',
    );
    this.popupService
      .getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.isPopupOpen.bind(this))
      .onSet(this.setPopupOpen.bind(this));

    this.thermostatService =
      this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat);
    this.thermostatService.setCharacteristic(
      this.platform.Characteristic.Name,
      'Temperature',
    );
    const temperatureCharacteristic = this.thermostatService
      .getCharacteristic(this.platform.Characteristic.TargetTemperature)
      .onGet(() => this.state.Temperature)
      .onSet((temperature) => (this.state.Temperature = temperature as number));
    temperatureCharacteristic.props.minValue = 4;
    temperatureCharacteristic.props.maxValue = 50;
    this.thermostatService
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(() => this.state.Temperature);
    this.thermostatService
      .getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(
        () => this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS,
      );
    this.thermostatService
      .getCharacteristic(this.platform.Characteristic.TargetHeatingCoolingState)
      .onGet(() => this.platform.Characteristic.TargetHeatingCoolingState.AUTO);
    this.thermostatService
      .getCharacteristic(this.platform.Characteristic.CurrentHeatingCoolingState)
      .onGet(
        () => this.platform.Characteristic.CurrentHeatingCoolingState.HEAT,
      );

    this.flowService =
      this.accessory.getService(this.platform.Service.Window) ||
      this.accessory.addService(this.platform.Service.Window);
    this.flowService.setCharacteristic(
      this.platform.Characteristic.Name,
      'Flow',
    );
    this.flowService.setCharacteristic(
      this.platform.Characteristic.PositionState,
      this.platform.Characteristic.PositionState.STOPPED,
    );
    this.flowService
      .getCharacteristic(this.platform.Characteristic.CurrentPosition)
      .onGet(() => this.state.Flow * 100);
    this.flowService
      .getCharacteristic(this.platform.Characteristic.TargetPosition)
      .onGet(() => this.state.Flow * 100)
      .onSet((flow) => (this.state.Flow = (flow as number) / 100));
  }

  async isPopupOpen(): Promise<CharacteristicValue> {
    const res = await this.API.getPopup();
    return res.state === 1;
  }

  async setPopupOpen(value: CharacteristicValue) {
    await this.API.postPopup(value as boolean);
  }
}
