import { useIsRestoring } from '@tanstack/react-query';
import AppLoading from '../AppLoading';

interface PersistGateProps {
  children: React.ReactNode;
}

/**
 * A component that will only render its children after the React Query cache
 * has finished restoring from persistence.
 *
 * If the cache is still restoring, this component will return `null`.
 *
 * This component is useful when you want to prevent your app from rendering
 * until the cache has been fully restored from persistence. This can prevent
 * your app from rendering outdated or incomplete data.
 *
 * This is also needed for suspense queries to be correctly restored.
 */
export const PersistGate = ({ children }: PersistGateProps) => {
  const isRestoring = useIsRestoring();
  return isRestoring ? <AppLoading /> : children;
};
