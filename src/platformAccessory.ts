import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge';

import { TrioEPlatform } from './platform';
import API from './api';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class TrioEPlatformAccessory {
  private faucetService: Service;
  private popupService: Service;
  private thermostatService: Service;
  private API: API;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private state = {
    Flow: 1,
    Temperature: 38,
  };

  constructor(
    private readonly platform: TrioEPlatform,
    private readonly accessory: PlatformAccessory,
  ) {
    this.API = new API(1, this.platform.config.ip, this.platform.config.secure ? 'https' : 'http');

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Viega')
      .setCharacteristic(this.platform.Characteristic.Model, 'Multiplex Trio E')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'ABCDEFGH')
      //Water faucet here
      .setCharacteristic(this.platform.Characteristic.ValveType, 3);

    // TODO : Get State here
    // Set interval every second to get state

    // get the Valve service if it exists, otherwise create a new LightBulb service
    // you can create multiple services for each accessory
    this.faucetService = this.accessory.getService(this.platform.Service.Valve) || this.accessory.addService(this.platform.Service.Valve);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.faucetService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/Lightbulb

    // register handlers for the On/Off Characteristic
    this.faucetService.getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))                // SET - bind to the `setOn` method below
      .onGet(this.getOn.bind(this));               // GET - bind to the `getOn` method below

    // register handlers for the Brightness Characteristic
    this.faucetService.getCharacteristic(this.platform.Characteristic.Brightness)
      .onSet(this.setFlow.bind(this));       // SET - bind to the 'setBrightness` method below

    /**
     * Creating multiple services of the same type.
     *
     * To avoid "Cannot add a Service with the same UUID another Service without also defining a unique 'subtype' property." error,
     * when creating multiple services of the same type, you need to use the following syntax to specify a name and subtype id:
     * this.accessory.getService('NAME') || this.accessory.addService(this.platform.Service.Lightbulb, 'NAME', 'USER_DEFINED_SUBTYPE_ID');
     *
     * The USER_DEFINED_SUBTYPE must be unique to the platform accessory (if you platform exposes multiple accessories, each accessory
     * can use the same sub type id.)
     */

    this.popupService = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.popupService.setCharacteristic(this.platform.Characteristic.Name, 'Popup');
    this.popupService.getCharacteristic(this.platform.Characteristic.On)
      .onGet(this.isPopupOpen.bind(this))
      .onSet(this.setPopupOpen.bind(this));

    this.thermostatService = this.accessory.getService(this.platform.Service.Thermostat) || this.accessory.addService(this.platform.Service.Thermostat);
    this.thermostatService.setCharacteristic(this.platform.Characteristic.Name, 'Temperature');
    const temperatureCharacteristic = this.thermostatService.getCharacteristic(this.platform.Characteristic.TargetTemperature);
    temperatureCharacteristic.props.minValue = 4;
    temperatureCharacteristic.props.maxValue = 50;
    temperatureCharacteristic.onGet(() => this.state.Temperature);
    temperatureCharacteristic.onSet((temperature) => this.state.Temperature = temperature as number);
    this.thermostatService.getCharacteristic(this.platform.Characteristic.CurrentTemperature).onGet(() => this.state.Temperature);
    this.thermostatService.getCharacteristic(this.platform.Characteristic.TemperatureDisplayUnits)
      .onGet(() => this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS)
      .onSet(() => this.platform.Characteristic.TemperatureDisplayUnits.CELSIUS);
    this.thermostatService.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .onGet(() => this.platform.Characteristic.TargetHeaterCoolerState.AUTO)
      .onSet(() => this.platform.Characteristic.TargetHeaterCoolerState.AUTO);
    this.thermostatService.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
      .onGet(() => this.platform.Characteristic.CurrentHeaterCoolerState.HEATING)
      .onSet(() => this.platform.Characteristic.CurrentHeaterCoolerState.HEATING);
  }

  async isPopupOpen(): Promise<CharacteristicValue> {
    const res = await this.API.getPopup();
    return res.state === 1;
  }

  async setPopupOpen(value: CharacteristicValue) {
    await this.API.postPopup(value as boolean);
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, turning on a Light bulb.
   */
  async setOn(value: CharacteristicValue) {
    // implement your own code to turn your device on/off
    //this.state.Faucet = value as boolean;

    // TODO : Call API to turn on or off the faucet

    this.platform.log.debug('Set Characteristic On ->', value);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async getOn(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    //const isOn = this.state.Faucet;

    // TODO: Get status from API for the faucet

    //this.platform.log.debug('Get Characteristic On ->', isOn);

    // if you need to return an error to show the device as "Not Responding" in the Home app:
    // throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);

    return false;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async setFlow(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.state.Flow = value as number;

    // TODO: API Set flow here

    this.platform.log.debug('Set Characteristic Flow -> ', value);
  }

  async setTemperature(value: CharacteristicValue) {
    // implement your own code to set the brightness
    this.state.Temperature = value as number;

    // TODO: API Set temperature here

    this.platform.log.debug('Set Characteristic Flow -> ', value);
  }
}
