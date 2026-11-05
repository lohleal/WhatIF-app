import Svg, { Path } from 'react-native-svg';

export default function CardWave({ color }) {
  return (
    <Svg
      width="130%"
      height={50}
      viewBox="0 0 300 65"
      preserveAspectRatio="none"
      pointerEvents="none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        zIndex: 0,
      }}
    >
      <Path
        d="
    M0 15
    C45 15 55 55 150 55
    C245 55 255 15 300 15
    L300 65
    L0 65
    Z
"
        fill={color}
        opacity={0.65}
      />
    </Svg>
  );
}