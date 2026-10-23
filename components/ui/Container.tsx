import type { HTMLAttributes } from "react";
import type { CSSProperties } from "react";
import { CONTAINER_MAX_WIDTH, CONTAINER_PADDING_X, CONTAINER_PADDING_X_MOBILE } from "@/lib/layout";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export function Container({ className = "", style, ...props }: ContainerProps) {
  const layoutStyle = {
    "--container-max-width": `${CONTAINER_MAX_WIDTH}px`,
    "--container-gutter-x": `${CONTAINER_PADDING_X * 2}px`,
    "--container-gutter-x-mobile": `${CONTAINER_PADDING_X_MOBILE * 2}px`,
  } as CSSProperties;

  return <div className={`container ${className}`.trim()} style={{ ...layoutStyle, ...style }} {...props} />;
}
