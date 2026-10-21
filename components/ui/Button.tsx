import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

type Variant = "primary" | "secondary";
type CommonProps = { variant?: Variant; small?: boolean; children: ReactNode; className?: string };

type LinkButtonProps = CommonProps & {
  href: string;
  target?: string;
  rel?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  "aria-label"?: string;
};
type NativeButtonProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  name?: string;
  value?: string;
  form?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  "aria-label"?: string;
};

export function Button(props: LinkButtonProps | NativeButtonProps) {
  const variant = props.variant ?? "primary";
  const small = props.small ?? false;
  const classes = `button button-${variant}${small ? " button-small" : ""}${props.className ? ` ${props.className}` : ""}`;
  if (typeof props.href === "string") {
    return <Link href={props.href} target={props.target} rel={props.rel} onClick={props.onClick} aria-label={props["aria-label"]} className={classes}>{props.children}</Link>;
  }
  const buttonProps = props as NativeButtonProps;
  return <button type={buttonProps.type} disabled={buttonProps.disabled} name={buttonProps.name} value={buttonProps.value} form={buttonProps.form} onClick={buttonProps.onClick} aria-label={buttonProps["aria-label"]} className={classes}>{buttonProps.children}</button>;
}
