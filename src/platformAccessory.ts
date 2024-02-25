import * as flowAccessory from './accessories/flowAccessory';
import * as popupAccessory from './accessories/popupAccessory';
import * as thermostatAccessory from './accessories/thermostatAccessory';
import * as volumeAccessory from './accessories/volumeAccessory';

import { PlatformAccessory } from 'homebridge';
import { TrioEPlatform } from './platform';

export class TrioEPlatformAccessory {
  constructor(
    private readonly platform: TrioEPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Viega')
      .setCharacteristic(
        this.platform.Characteristic.Model,
        'Multiplex Trio E',
      );

    const popupService =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch);
    popupAccessory.register(popupService, this.platform);

    const thermostatService =
      this.accessory.getService(this.platform.Service.Thermostat) ||
      this.accessory.addService(this.platform.Service.Thermostat);
    thermostatAccessory.register(thermostatService, this.platform);

    const flowService =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);
    flowAccessory.register(flowService, this.platform);

    const volumeService =
      this.accessory.getService(this.platform.Service.Lightbulb) ||
      this.accessory.addService(this.platform.Service.Lightbulb);
    volumeAccessory.register(volumeService, this.platform);
  }
}
