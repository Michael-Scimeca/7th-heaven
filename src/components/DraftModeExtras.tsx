import { draftMode } from "next/headers";
import dynamic from "next/dynamic";

const SanityLive = dynamic(() => import("@/sanity/live").then((m) => m.SanityLive));
const VisualEditing = dynamic(() => import("next-sanity/visual-editing").then((m) => m.VisualEditing));

// Isolates the one dynamic API read (draftMode()) that used to sit directly
// in the root layout's body. Cache Components requires any uncached dynamic
// read in a Server Component to be wrapped in Suspense (or "use cache") --
// draftMode() is inherently per-request and can't be cached, so Suspense is
// the right tool. Pulling it into its own component means the boundary only
// wraps this one read instead of forcing the entire root layout (which
// wraps every route in the app) to be dynamic.
export default async function DraftModeExtras() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <SanityLive />
      <VisualEditing />
    </>
  );
}
