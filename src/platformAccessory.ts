import * as flowAccessory from './accessories/flowAccessory';
import * as leakAccessory from './accessories/leakAccessory';
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

    const popupService = this.accessory.addService(
      new this.platform.Service.Window('Popup'),
    );
    popupAccessory.register(popupService, this.platform);

    const thermostatService = this.accessory.addService(
      new this.platform.Service.Thermostat('Temperature'),
    );
    thermostatAccessory.register(thermostatService, this.platform);

    const flowService = this.accessory.addService(
      new this.platform.Service.Lightbulb('Fill by flow', 'flow'),
    );
    flowAccessory.register(flowService, this.platform);

    const volumeService = this.accessory.addService(
      new this.platform.Service.Lightbulb('Fill by volume', 'volume'),
    );
    volumeAccessory.register(volumeService, this.platform);

    const leakService = this.accessory.addService(
      new this.platform.Service.ContactSensor('Faucet'),
    );
    leakAccessory.register(leakService, this.platform);
  }
}
