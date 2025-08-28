import { TouchableOpacity, useWindowDimensions } from 'react-native';


export default function appStyle() {
    const {height, width, scale, fontScale} = useWindowDimensions();
    return {
        screenHeight: height,
        screenWidth: width,
        scale,
        fontscale,
        headerHeight: height*0.1,
        contentWidth: width*0.9,

    }
}