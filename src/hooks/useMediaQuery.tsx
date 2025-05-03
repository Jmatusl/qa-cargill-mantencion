import { useState, useEffect } from "react";

interface MediaQueryHookProps {
  query: string;
}

/**
 * useMediaQuery Hook to listen to media query changes.
 *
 * @param {MediaQueryHookProps} props - The hook props.
 * @returns {boolean} - True if the document matches the media query, false otherwise.
 */
function useMediaQuery({ query }: MediaQueryHookProps): boolean {
  // State and setter for matched value
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Function to evaluate the media query and set the state
    const media = window.matchMedia(query);

    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Listener for media query changes
    const listener = () => {
      setMatches(media.matches);
    };

    media.addListener(listener);

    // Cleanup function to remove listener on unmount
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}

export default useMediaQuery;
