# homebridge-trio-e

Homebridge plugin to control a Viega Multiplex Trio E bath controller.

Once configured (by specifying the WLAN module IP address) you get these controls :

- Water temperature (via an always-on thermostat since we can't have anything else to set temperature properly)
- Water flow (from 0% to 100%)
- Water flow ON/OFF
- Popup ON/OFF (to evacuate water)

For now, quick access programs aren't supported, but they'll be in the future (they cannot be set through the API, only via physical access to the buttons)