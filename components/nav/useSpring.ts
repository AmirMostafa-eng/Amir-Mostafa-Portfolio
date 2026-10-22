export type SpringConfig = { stiffness: number; damping: number; mass?: number };
export type Spring = { value: number; target: number; velocity: number; config: Required<SpringConfig> };

export function createSpring(value: number, config: SpringConfig): Spring {
  return { value, target: value, velocity: 0, config: { ...config, mass: config.mass ?? 1 } };
}

export function setSpringTarget(spring: Spring, target: number) {
  spring.target = target;
}

/** Stable semi-implicit integration with substeps for long or delayed frames. */
export function stepSpring(spring: Spring, deltaSeconds: number) {
  const total = Math.min(Math.max(deltaSeconds, 0), 0.12);
  const steps = Math.max(1, Math.ceil(total / (1 / 120)));
  const dt = steps ? total / steps : 0;
  for (let i = 0; i < steps; i += 1) {
    const { stiffness, damping, mass } = spring.config;
    const acceleration = (-stiffness * (spring.value - spring.target) - damping * spring.velocity) / mass;
    spring.velocity += acceleration * dt;
    spring.value += spring.velocity * dt;
  }
}

export function springSettled(spring: Spring, epsilon = 0.08) {
  return Math.abs(spring.target - spring.value) < epsilon && Math.abs(spring.velocity) < epsilon;
}
