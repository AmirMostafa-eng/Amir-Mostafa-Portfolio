import { RoleShimmer } from "@/components/landing/roles/RoleShimmer";
import { RoleRotate } from "@/components/landing/roles/RoleRotate";
import { RoleTypewriter } from "@/components/landing/roles/RoleTypewriter";

export type RoleEffect = "typewriter" | "rotate" | "shimmer";
export type RoleList = readonly [string, ...string[]];

type HeroRoleProps = { roles: RoleList; effect: RoleEffect };

export function HeroRole({ roles, effect }: HeroRoleProps) {
  if (effect === "rotate") return <RoleRotate roles={roles} />;
  if (effect === "shimmer") return <RoleShimmer roles={roles} />;
  return <RoleTypewriter roles={roles} />;
}
