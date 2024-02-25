const STATE = {
  Flow: 1,
  Duration: 0,
  Temperature: 38,
};

export const setFlow = (value: number) => (STATE.Flow = value);
export const getFlow = () => STATE.Flow;
export const setDuration = (value: number) => (STATE.Duration = value);
export const getDuration = () => STATE.Duration;
export const setTemperature = (value: number) => (STATE.Temperature = value);
export const getTemperature = () => STATE.Temperature;
