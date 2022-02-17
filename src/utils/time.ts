export const hours = Number(
  new Date().getHours().toLocaleString("pt-BR", { minimumIntegerDigits: 2 })
);

export const minutes = Number(
  new Date().getMinutes().toLocaleString("pt-BR", { minimumIntegerDigits: 2 })
);

export const seconds = Number(
  new Date().getSeconds().toLocaleString("pt-BR", { minimumIntegerDigits: 2 })
);

export const fullTime = `${hours}:${minutes}:${seconds}`;

export const date = (date = new Date()): string => date.toLocaleDateString("pt-BR");

const TimeUtils = {
  hours,
  minutes,
  seconds,
  fullTime,
  date,
};

export default TimeUtils;