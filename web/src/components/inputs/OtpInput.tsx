interface Props {
  otp: string;
  numberOfDigits?: number;
  setOtp: React.Dispatch<React.SetStateAction<string>>;
}

const OtpInput: React.FC<Props> = ({ otp, setOtp, numberOfDigits = 6 }) => {
  const updateOtp = (e: React.ChangeEvent<HTMLInputElement>) => {
    let formatedOtp: string;
    const typedCharacter = e.target.value;
    const pressedBackspace = typedCharacter.length === 0;

    if (pressedBackspace) {
      // remove last typed character from otp
      formatedOtp = otp.slice(0, otp.length - 1);
    } else {
      // append typed character to otp
      formatedOtp = otp.concat(typedCharacter);
    }

    setOtp(formatedOtp);
  };

  const updateFocus = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputTag = e.currentTarget;
    type InputElement = HTMLInputElement | null;

    if (inputTag.value.length === 1) {
      const nextSibling = inputTag.nextElementSibling as InputElement;
      nextSibling?.focus();
    } else if (e.key === 'Backspace') {
      const previousSibling = inputTag.previousElementSibling as InputElement;
      previousSibling?.focus();
    }
  };

  const otpInputs = Array.from({ length: numberOfDigits }, (_, index) => {
    const isFirstInput = index === 0;
    const value = otp.charAt(index);

    return (
      <input
        type='text'
        key={index}
        value={value}
        maxLength={1}
        inputMode='numeric'
        onChange={updateOtp}
        onKeyUp={updateFocus}
        autoFocus={isFirstInput}
        autoComplete='one-time-code'
        className={`otp-input outline-primary-500 w-full aspect-square border-2 border-primary-200 duration-300 rounded-[10px] text-center font-medium text-3xl focus:bg-transparent ${
          value ? 'bg-transparent' : 'bg-primary-50'
        }`}
      />
    );
  });

  return (
    <div className='w-full grid grid-cols-[repeat(6,1fr)] items-center justify-center gap-x-1.5 md:gap-x-3 lg:gap-x-4'>
      {otpInputs}
    </div>
  );
};

export default OtpInput;
