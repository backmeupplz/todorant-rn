import Svg, { Circle, Path } from 'react-native-svg'

function SvgComponent(props: any) {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
      <Path
        d="M15.48 25.162a3 3 0 01-2.96 0l-3.74-2.12-3.707-2.18A3 3 0 013.594 18.3L3.56 14l.034-4.3a3 3 0 011.48-2.562l3.706-2.18 3.74-2.12a3 3 0 012.96 0l3.74 2.12 3.707 2.18A3 3 0 0124.405 9.7l.034 4.3-.034 4.3a3 3 0 01-1.48 2.562l-3.706 2.18-3.74 2.12z"
        fill="#6E7185"
      />
      <Circle cx={14} cy={14} r={4} fill="#C5C6CE" />
    </Svg>
  )
}

export default SvgComponent
