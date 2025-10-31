interface AlertProps {
  msg: string;
  zIndex?: string;
  bgColor?: string;
  duration?: number;
  textColor?: string;
}

interface FormProps {
  extraInputClass?: string;
  children?: React.ReactNode;
  extraContainerClass?: string;
  inputRef?: React.RefObject<HTMLInputElement>;
}

interface ClipboardProps {
  text: string;
  onFailure?: () => void;
  onSuccess?: () => void;
}
