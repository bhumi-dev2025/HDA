import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Svg, {
  Defs,
  FeBlend,
  FeColorMatrix,
  FeFlood,
  FeGaussianBlur,
  FeMorphology,
  FeOffset,
  Filter,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop
} from "react-native-svg";

interface PathButtonProps {
  icon: any;
  onPress: () => void;
  locked?: boolean;
}

const SIZE = 97;
const ICON_SIZE = 36;

export default function PathButton({
  icon,
  onPress,
  locked = false,
}: PathButtonProps) {
  return (
    <TouchableOpacity
      onPress={locked ? undefined : onPress}
      activeOpacity={locked ? 1 : 0.75}
      style={{
        width: SIZE,
        height: 67,
        alignItems: "center",
        justifyContent: "center",
        opacity: locked ? 0.4 : 1,
      }}
    >
      {/* SVG Button Background */}
      <Svg width={SIZE} height={67} viewBox="0 0 97 67" fill="none">
        <Defs>
          <Filter
            id="filter0_dd"
            x="0"
            y="0"
            width="96.8492"
            height="65.9612"
            filterUnits="userSpaceOnUse"
          >
            <FeFlood floodOpacity="0" result="BackgroundImageFix" />
            <FeColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <FeMorphology
              radius="2"
              operator="erode"
              in="SourceAlpha"
              result="effect1_dropShadow"
            />
            <FeOffset dy="4" />
            <FeGaussianBlur stdDeviation="3" />
            <FeColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"
            />
            <FeBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow"
            />
            <FeColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <FeMorphology
              radius="3"
              operator="erode"
              in="SourceAlpha"
              result="effect2_dropShadow"
            />
            <FeOffset dy="10" />
            <FeGaussianBlur stdDeviation="7.5" />
            <FeColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
            />
            <FeBlend
              mode="normal"
              in2="effect1_dropShadow"
              result="effect2_dropShadow"
            />
            <FeBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect2_dropShadow"
              result="shape"
            />
          </Filter>
          <RadialGradient
            id="paint0_radial"
            cx="0"
            cy="0"
            r="1"
            gradientTransform="matrix(0.210544 48.8626 -54.4063 0.403019 48.4246 -15.9439)"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#656565" />
            <Stop offset="1" stopColor="#4B4B4B" />
          </RadialGradient>
          <LinearGradient
            id="paint1_linear"
            x1="52.7442"
            y1="-1.37188"
            x2="52.7442"
            y2="43.9611"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="white" />
            <Stop offset="1" />
          </LinearGradient>
        </Defs>

        {/* Bottom shadow disc */}
        <Path
          d="M48.5154 66.1423C68.6321 66.1423 84.94 56.749 84.94 45.1617C84.94 33.5745 68.6321 24.1812 48.5154 24.1812C28.3987 24.1812 12.0908 33.5745 12.0908 45.1617C12.0908 56.749 28.3987 66.1423 48.5154 66.1423Z"
          fill="#4D4D4D"
        />
        {/* Border ring */}
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.0252 30.7856C16.5135 34.5364 12.6222 39.6384 12.6222 45.1619C12.6222 50.6854 16.5135 55.7874 23.0252 59.5382C29.5228 63.2807 38.5343 65.6125 48.5168 65.6125C58.4993 65.6125 67.5108 63.2807 74.0083 59.5382C80.5201 55.7874 84.4114 50.6854 84.4114 45.1619C84.4114 39.6384 80.5201 34.5364 74.0083 30.7856C67.5108 27.043 58.4993 24.7113 48.5168 24.7113C38.5343 24.7113 29.5228 27.043 23.0252 30.7856ZM22.4962 29.8672C29.1818 26.0163 38.3826 23.6514 48.5168 23.6514C58.651 23.6514 67.8518 26.0163 74.5374 29.8672C81.2087 33.7099 85.4713 39.0981 85.4713 45.1619C85.4713 51.2256 81.2087 56.6139 74.5374 60.4566C67.8518 64.3075 58.651 66.6724 48.5168 66.6724C38.3826 66.6724 29.1818 64.3075 22.4962 60.4566C15.8249 56.6139 11.5623 51.2256 11.5623 45.1619C11.5623 39.0981 15.8249 33.7099 22.4962 29.8672Z"
          fill="#4D4D4D"
        />
        {/* Side/back fill */}
        <Path
          d="M84.8492 40.344C84.8492 51.2791 68.5463 60.1283 48.4246 60.1283C28.3029 60.1283 12 51.2637 12 40.344L12 25.5288C12 25.5288 33.3333 27.9367 48.4246 27.9367C63.5159 27.9367 84.8492 25.5288 84.8492 25.5288L84.8492 40.344Z"
          fill="#282828"
        />
        {/* Top face with gradient + filter */}
        <G filter="url(#filter0_dd)">
          <Path
            d="M48.4246 43.9611C68.5413 43.9611 84.8492 34.5678 84.8492 22.9806C84.8492 11.3933 68.5413 2 48.4246 2C28.3078 2 12 11.3933 12 22.9806C12 34.5678 28.3078 43.9611 48.4246 43.9611Z"
            fill="rgba(255,255,255,0.05)"
          />
          <Path
            d="M48.4246 43.9611C68.5413 43.9611 84.8492 34.5678 84.8492 22.9806C84.8492 11.3933 68.5413 2 48.4246 2C28.3078 2 12 11.3933 12 22.9806C12 34.5678 28.3078 43.9611 48.4246 43.9611Z"
            fill="url(#paint0_radial)"
          />
          {/* Border stroke */}
          <Path
            d="M48.4248 2.5C58.4113 2.50003 67.4279 4.83264 73.9307 8.57812C80.4469 12.3315 84.3496 17.4417 84.3496 22.9805C84.3496 28.5192 80.4469 33.6294 73.9307 37.3828C67.4279 41.1283 58.4114 43.4609 48.4248 43.4609C38.438 43.4609 29.4208 41.1285 22.918 37.3828C16.4017 33.6294 12.5 28.5192 12.5 22.9805C12.5 17.4417 16.4017 12.3315 22.918 8.57812C29.4208 4.83248 38.438 2.5 48.4248 2.5Z"
            stroke="url(#paint1_linear)"
            strokeOpacity="0.13"
          />
        </G>
      </Svg>

      {/* Icon on top — centered on the top face */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 44, // top face height
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          source={icon}
          style={{
            width: ICON_SIZE,
            height: ICON_SIZE,
            opacity: locked ? 0.3 : 1,
          }}
          resizeMode="contain"
        />
      </View>
    </TouchableOpacity>
  );
}
