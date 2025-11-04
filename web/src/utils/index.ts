import { nets } from 'face-api.js';

import constants from '../constants';

export const addClass = (element?: HTMLElement | null, ...classes: string[]) => {
  element?.classList.add(...classes);
};

export const removeClass = (element?: HTMLElement | null, ...classes: string[]) => {
  element?.classList.remove(...classes);
};

export const toggleClass = (element?: HTMLElement | null, ...classes: string[]) => {
  if (element) classes.forEach(className => element.classList.toggle(className));
};

export const showAlert = ({
  msg,
  bgColor,
  textColor,
  zIndex = '0',
  type = 'info',
  duration = 3000,
}: AlertProps) => {
  const alertDiv: HTMLDivElement = document.createElement('div');
  alertDiv.className = 'alert';
  addClass(
    alertDiv,
    'p-4',
    'mb-8',
    'fixed',
    'w-max',
    'left-1/2',
    'z-[9999]',
    'text-base',
    'shadow-lg',
    'rounded-md',
    'text-white',
    'ease-in-out',
    'text-center',
    'max-w-[80vw]',
    'duration-500',
    'font-semibold',
    'transition-all',
    '-translate-x-1/2',
    'tracking-[0.04em]'
  );

  alertDiv.style.bottom = '-150px';
  document.body.appendChild(alertDiv);

  setTimeout(() => {
    const { COLORS } = constants;
    alertDiv.style.background = bgColor ?? type === 'error' ? COLORS.ERROR : COLORS.PRIMARY[500];

    if (textColor) alertDiv.style.color = textColor;
    alertDiv.innerHTML = msg;
    alertDiv.style.bottom = '0px';

    if (zIndex !== '0') alertDiv.style.zIndex = zIndex;

    setTimeout(() => {
      alertDiv.style.bottom = '-150px';
      setTimeout(() => document.body.removeChild(alertDiv), 1000);
    }, duration);
  }, 200);
};

export const secondsToMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secondsLeft = seconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;
};

export const updateFormData = (formData: FormData) => {
  return ([field, value]: [string, any]) => {
    const isPrimitive = typeof value === 'string' || value instanceof Blob;
    formData.append(field, isPrimitive ? value : JSON.stringify(value));
  };
};

export const copyToClipboard = async ({ text, onFailure, onSuccess }: ClipboardProps) => {
  try {
    await navigator.clipboard.writeText(text);
    onSuccess?.();
  } catch (error) {
    console.error('Failed to copy text:', error);
    onFailure?.();
  }
};

export const generateTimeSlots = (spacingMinutes: number): string[] => {
  const slots: string[] = [];
  const maxMinutes = 23 * 60 + 59; // 23:59 in minutes

  for (let minutes = 0; minutes <= maxMinutes; minutes += spacingMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    slots.push(timeStr);
  }

  return slots;
};

export const loadFaceModels = async (onLoaded?: () => void) => {
  const MODEL_URL = `${window.location.origin}/models`;
  await Promise.all([
    nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  ]).then(onLoaded);
};

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
