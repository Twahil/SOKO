
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppErrorComponent } from "../../error-component";

export const Route = createRootRoute({
  component: () => <Outlet />,
  errorComponent: AppErrorComponent,
});
