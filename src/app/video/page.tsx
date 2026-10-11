import { permanentRedirect } from "next/navigation";

export default function VideoRedirectPage() {
  permanentRedirect("/media");
}
