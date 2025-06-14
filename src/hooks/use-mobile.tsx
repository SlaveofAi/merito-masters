
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const EXTRA_SMALL_BREAKPOINT = 480

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [initialized, setInitialized] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to update state based on window size
    const updateSize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      if (!initialized) setInitialized(true)
    }

    // Initial check
    updateSize()

    // Set up event listener
    window.addEventListener('resize', updateSize)
    
    // Clean up
    return () => window.removeEventListener('resize', updateSize)
  }, [initialized])

  // Return false during SSR, and the actual value after initialization
  return isMobile
}

export function useIsExtraSmall() {
  const [isExtraSmall, setIsExtraSmall] = React.useState<boolean>(false)
  const [initialized, setInitialized] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to update state based on window size
    const updateSize = () => {
      setIsExtraSmall(window.innerWidth < EXTRA_SMALL_BREAKPOINT)
      if (!initialized) setInitialized(true)
    }

    // Initial check
    updateSize()

    // Set up event listener
    window.addEventListener('resize', updateSize)
    
    // Clean up
    return () => window.removeEventListener('resize', updateSize)
  }, [initialized])

  // Return false during SSR, and the actual value after initialization
  return isExtraSmall
}
