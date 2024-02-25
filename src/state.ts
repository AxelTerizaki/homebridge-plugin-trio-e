const STATE = {
  Flow: 0,
  Duration: 0,
  Temperature: 38,
};

export const getFlow = () => STATE.Flow * 100;
export const setFlow = (value: number) => (STATE.Flow = value / 100);

export const getDuration = () => STATE.Duration;
export const setDuration = (value: number) => (STATE.Duration = value);

export const getTemperature = () => STATE.Temperature;
export const setTemperature = (value: number) => (STATE.Temperature = value);
