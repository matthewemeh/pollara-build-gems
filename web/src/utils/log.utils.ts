import { isDevMode } from '../helpers/devDetect';

export const log = (...data: any[]) => {
  isDevMode() && console.log(...data);
};

export const warn = (...data: any[]) => {
  isDevMode() && console.warn(...data);
};

export const error = (...data: any[]) => {
  isDevMode() && console.error(...data);
};
