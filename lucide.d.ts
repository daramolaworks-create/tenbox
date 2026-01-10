
import 'lucide-react-native';
import { SvgProps } from 'react-native-svg';
import { StyleProp, ViewStyle } from 'react-native';

declare module 'lucide-react-native' {
    export interface LucideProps extends SvgProps {
        size?: number | string;
        absoluteStrokeWidth?: boolean;
        color?: string;
        style?: StyleProp<ViewStyle>;
    }
}
