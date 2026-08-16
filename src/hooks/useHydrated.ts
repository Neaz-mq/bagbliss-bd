'use client'

import { useSyncExternalStore } from 'react'

/**
 * Returns `false` during server render and the initial client render,
 * then `true` after hydration completes.
 *
 * This is the React-recommended replacement for the old
 * `const [mounted, setMounted] = useState(false); useEffect(() => setMounted(true), [])`
 * pattern, which triggers the `react-hooks/set-state-in-effect` lint warning.
 * `useSyncExternalStore` lets React know about the client/server value
 * difference without an effect-driven state update.
 */
function subscribe() {
  // Hydration status never changes after mount, so there's nothing to
  // subscribe to — return a no-op unsubscribe function.
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
