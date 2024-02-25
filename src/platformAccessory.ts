import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import API from './api';
import * as flowAccessory from './accessories/flowAccessory';
import * as popupAccessory from './accessories/popupAccessory';
import * as thermostatAccessory from './accessories/thermostatAccessory';
import { TrioEPlatform } from './platform';

export class TrioEPlatformAccessory {
  private popupService: Service;
  private thermostatService: Service;
  private flowService: Service;
  private fillService: Service;
  private API: API;

  private state = {
    Flow: 1,
    Duration: 0,
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
    popupAccessory.register(this.popupService, this.platform);

    this.thermostatService =
      this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat);
    thermostatAccessory.register(this.thermostatService, this.platform);

    this.flowService =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);
    flowAccessory.register(this.flowService, this.platform);

    this.fillService =
      this.accessory.getService(this.platform.Service.Valve) ||
      this.accessory.addService(this.platform.Service.Valve);
    this.fillService.setCharacteristic(
      this.platform.Characteristic.Name,
      'Fill Bath',
    );
    this.fillService.setCharacteristic(
      this.platform.Characteristic.ValveType,
      this.platform.Characteristic.ValveType.WATER_FAUCET,
    );
    this.fillService
      .getCharacteristic(this.platform.Characteristic.Active)
      .onGet(this.isFilling.bind(this))
      .onSet(this.fillBathtub.bind(this));
    this.fillService
      .getCharacteristic(this.platform.Characteristic.InUse)
      .onGet(this.isFilling.bind(this));
    this.fillService
      .getCharacteristic(this.platform.Characteristic.RemainingDuration)
      .onGet(this.getProgress.bind(this));
    this.fillService
      .getCharacteristic(this.platform.Characteristic.SetDuration)
      .onGet(() => this.state.Duration)
      .onSet((value) => (this.state.Duration = value as number));
  }

  async isFilling(): Promise<CharacteristicValue> {
    const res = await this.API.getState();
    return res.state !== 'a';
  }

  async getProgress(): Promise<CharacteristicValue> {
    const res = await this.API.getState();
    return res.progress;
  }

  async fillBathtub(value: CharacteristicValue) {
    const proceed = value as boolean;

    if (proceed) {
      await this.API.postQuick();
      await this.API.postTlc(this.state.Temperature, this.state.Flow, true);
    } else {
      await this.API.postTlc(this.state.Temperature, this.state.Flow, false);
    }
  }
}
