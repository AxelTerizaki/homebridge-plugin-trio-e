import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { TrioEPlatformAccessory } from './platformAccessory';
import * as TrioEApi from './api';

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class TrioEPlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;

  // this is used to track restored cached accessories
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', async () => {
      log.debug('Executed didFinishLaunching callback');
      await this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);
    this.accessories.push(accessory);
  }

  async discoverDevices() {
    // generate a unique id for the accessory this should be generated from
    // something globally unique, but constant, for example, the device serial
    // number or MAC address

    const TripEApi = new TrioEApi.default(
      1,
      this.config.ip,
      this.config.secure ? 'https' : 'http',
    );
    const res = await TripEApi.getTlc();
    const device = {
      uniqueId: this.api.hap.uuid.generate(res.mac_address),
      displayName: res.name,
    };

    // see if an accessory with the same uuid has already been registered and restored from
    // the cached devices we stored in the `configureAccessory` method above
    const existingAccessory = this.accessories.find(
      (accessory) => accessory.UUID === device.uniqueId,
    );

    if (existingAccessory) {
      // the accessory already exists
      this.log.info(
        'Removing existing accessory from cache:',
        existingAccessory.displayName,
      );

      this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
        existingAccessory,
      ]);
    }

    this.log.info('Adding new accessory:', device.displayName);

    // create a new accessory
    const accessory = new this.api.platformAccessory(
      device.displayName,
      device.uniqueId,
    );

    accessory.context.device = device;

    new TrioEPlatformAccessory(this, accessory);

    // link the accessory to your platform
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
      accessory,
    ]);
  }
}
