import React from "react";
import githubUrl from "../../assets/github-mark.svg";

interface GithubIconProps {
  url: string,
  style: React.CSSProperties | undefined,
}
export const GithubIcon = ({url, style}: GithubIconProps) => {
  return (
    <a href={url} target="_blank">
      <div className="github-icon" style={style ? style : {}}>
        <img src={githubUrl} />
      </div>
    </a>
  )
} 
GithubIcon.defaultProps = {
  style: undefined
}
