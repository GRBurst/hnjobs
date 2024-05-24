import React from "react";
import GithubUrlLightMode from "../../assets/github-mark.svg";
import GithubUrlDarkMode from "../../assets/github-mark-white.svg";

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