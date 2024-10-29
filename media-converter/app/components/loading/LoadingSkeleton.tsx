interface Props {
  width: string;
  height: string;
}

export default function LoadingSkeleton(props: Props) {
  return (
    <div
      className="animate-pulse bg-black/5"
      style={{ width: props.width, height: props.height }}
    />
  );
}
