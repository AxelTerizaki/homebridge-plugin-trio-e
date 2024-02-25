const STATE = {
  Temperature: 38,
};

export const getTemperature = () => STATE.Temperature;
export const setTemperature = (value: number) => (STATE.Temperature = value);
