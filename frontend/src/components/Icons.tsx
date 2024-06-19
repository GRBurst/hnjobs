import React from "react";
import Icon from '@ant-design/icons';

// import {lazy} from "react";

// const GithubUrlLightMode = lazy(() => import("../../assets/github-mark.svg"));
// const GithubUrlDarkMode = lazy(() => import("../../assets/github-mark-white.svg"));
import GithubUrlLightMode from "../../assets/github-mark.svg";
import GithubUrlDarkMode from "../../assets/github-mark-white.svg";
// import DesignPaletteSvg from "../../assets/design-palette.svg";

import type { GetProps } from 'antd';

type CustomIconComponentProps = GetProps<typeof Icon>;

interface GithubIconProps {
  url: string,
  darkMode: boolean,
  style: React.CSSProperties | undefined,
}
export const GithubIcon = ({ url, darkMode, style }: GithubIconProps) => {
  return (
    <a href={url} target="_blank">
      <div className="github-icon" style={style ? style : {}}>
        <img src={darkMode ? GithubUrlDarkMode : GithubUrlLightMode} />
      </div>
    </a>
  )
}
GithubIcon.defaultProps = {
  darkMode: false,
  style: undefined,
}

const DesignPaletteSvg = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 60.014756 54.388945">
    <path
      d="m 47.614757,18.779152 c 8.8,-15.0999997 -9.3,-24.8999997 -32.3,-14.3999997 -14.0999996,6.4999997 -23.8999996,26.4999997 -4.3,43.6999997 13.9,12.2 49,5.3 49,-8.7 0,-15.5 -21.7,-4.8 -12.4,-20.6"
      fill="#f6c799"
      id="path1" />
    <path
      d="m 31.214757,40.279152 c -3.1,-2.4 -8,-2.4 -11.1,0 -3.1,2.4 -3.1,6.2 0,8.6 3.1,2.4 8,2.4 11.1,0 3,-2.4 3,-6.3 0,-8.6"
      fill="#2caece"
      id="path2" />
    <path
      d="m 17.614757,28.779152 c -3.4,-1.6 -7.9999996,-0.6 -10.3999996,2.3 -2.4,2.9 -1.6,6.5 1.8,8.1 3.3999996,1.6 7.9999996,0.6 10.3999996,-2.3 2.4,-2.9 1.6,-6.5 -1.8,-8.1"
      fill="#fdf516"
      id="path3" />
    <path
      d="m 15.014757,15.779152 c -2.9,-1.6 -7.1999996,-0.9 -9.3999996,1.6 -2.3,2.5 -1.7,5.8 1.2,7.3 2.9,1.6 7.1999996,0.9 9.3999996,-1.6 2.2,-2.5 1.7,-5.7 -1.2,-7.3"
      fill="#ff5555"
      id="path4" />
    <path
      d="m 26.414757,5.9791523 c -2.8,-1.6 -6.9,-1 -9.1,1.4 -2.2,2.4 -1.8,5.4999997 1.1,7.0999997 2.8,1.6 6.9,1 9.1,-1.4 2.2,-2.4 1.7,-5.5999997 -1.1,-7.0999997"
      fill="#83bf4f"
      id="path5" />
    <path
      d="m 42.714757,4.8791523 c -2.2,-1.8 -5.9,-2.2 -8.5,-1 -2.5,1.2 -2.8,3.7 -0.6,5.5 2.2,1.7999997 5.9,2.1999997 8.5,0.9999997 2.5,-1.2999997 2.7,-3.6999997 0.6,-5.4999997"
      fill="#9156b7"
      id="path6" />
    <path
      d="m 38.014757,37.279152 c -1.9,2.1 -11.5,4 -11.5,4 0,0 3.8,-3.5 5.5,-9.2 0.8,-2.7 4.7,-2.7 6.4,-1.2 1.7,1.4 1.5,4.3 -0.4,6.4"
      fill="#947151"
      id="path7" />
    <path
      d="m 56.714757,7.4791523 c 1,-0.1 2.9,1.6 3,2.5 0.3,4.2999997 -17.7,19.6999997 -17.7,19.6999997 l -3,-2.5 c 0,0 13.3,-19.3999997 17.7,-19.6999997"
      fill="#666666"
      id="path8" />
    <path
      d="m 36.414757,30.079152 3,2.5 2.6,-2.9 -3,-2.5 z"
      fill="#cccccc"
      id="path9" />
    <path
      d="m 49.770148,35.951504 c -3.035299,-1.089478 -6.968822,0.213364 -8.718644,2.958929 -1.749821,2.745565 -0.817588,5.729009 2.316191,6.801122 3.035299,1.089478 6.968822,-0.213365 8.718643,-2.958929 1.749822,-2.745565 0.701744,-5.810126 -2.31619,-6.801122"
      fill="#ffffff"
      id="path10" />
  </svg>
);


export const DesignPaletteIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={DesignPaletteSvg} {...props} />
);
