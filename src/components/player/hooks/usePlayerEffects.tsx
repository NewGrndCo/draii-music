import { useVisualEffects } from './useVisualEffects';

export const usePlayerEffects = () => {
  const { lightPosition } = useVisualEffects();
  return { lightPosition };
};
