interface Props {
  visible?: boolean;
  extraClassNames?: string;
  extraStyles?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

const Overlay: React.FC<Props> = ({ extraStyles, extraClassNames, onClick, visible }) => {
  return (
    <div
      onClick={onClick}
      style={extraStyles}
      className={`fixed inset-0 z-50 bg-[rgba(0,0,0,0.5)] duration-300 ${
        visible || 'opacity-0 invisible'
      } ${extraClassNames}`}
    />
  );
};

export default Overlay;
