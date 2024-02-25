import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import API from './api';
import * as popupAccessory from './accessories/popupAccessory';
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
      .onGet(() => this.platform.Characteristic.TargetHeatingCoolingState.AUTO)
      .onSet((value: CharacteristicValue) => {
        if (
          value !== this.platform.Characteristic.TargetHeaterCoolerState.AUTO
        ) {
          this.thermostatService.setCharacteristic(
            this.platform.Characteristic.TargetHeatingCoolingState,
            this.platform.Characteristic.TargetHeaterCoolerState.AUTO,
          );
        }
      });
    this.thermostatService
      .getCharacteristic(
        this.platform.Characteristic.CurrentHeatingCoolingState,
      )
      .onGet(() => this.platform.Characteristic.CurrentHeatingCoolingState.OFF)
      .onSet((value: CharacteristicValue) => {
        if (
          value !== this.platform.Characteristic.CurrentHeatingCoolingState.OFF
        ) {
          this.thermostatService.setCharacteristic(
            this.platform.Characteristic.CurrentHeatingCoolingState,
            this.platform.Characteristic.CurrentHeatingCoolingState.OFF,
          );
        }
      });

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
