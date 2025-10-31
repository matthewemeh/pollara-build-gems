interface Props {
  extraClassNames?: string;
}

const Loading: React.FC<Props> = ({ extraClassNames }) => {
  return (
    <div
      className={`loading m-auto size-15 relative flex items-center justify-center ${extraClassNames}`}
    >
      <div className='border-[5px] border-primary-700 rounded-[50px] size-[55px] absolute border-l-transparent animate-[rotate-right_1s_linear_infinite]' />
      <div className='border-[5px] border-primary-700 rounded-[50px] w-10.5 h-10 border-t-transparent border-r-transparent m-[7.5px] animate-[rotate-left_1.5s_linear_infinite]' />
    </div>
  );
};

export default Loading;
