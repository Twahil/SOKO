import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { SiteShell } from "@/components/site-shell";
import { Toaster } from "sonner";
import appCss from "../../styles.css?url";

const APP_NAME = "SOKO";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "SOKO ni soko la kidijitali lililotengenezwa Tanzania kwa ajili ya kuuza na kuagiza mazao safi.",
      },
      { name: "theme-color", content: "#245c38" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500;1,9..144,600&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: () => (
    <html lang="sw" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <SiteShell>
            <Outlet />
          </SiteShell>
          <Toaster
            position="top-center"
            toastOptions={{ className: "font-sans" }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
