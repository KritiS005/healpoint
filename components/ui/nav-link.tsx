import * as React from "react";

import { cn } from "@/lib/utils";

type NavLinkProps = React.ComponentProps<"a"> & {
  active?: boolean;
};

function NavLink({ className, active = false, ...props }: NavLinkProps) {
  return (
    <a
      data-cursor="interactive"
      data-active={active}
      className={cn(
        "relative inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground focus-ring data-[active=true]:text-foreground",
        "after:absolute after:bottom-1.5 after:left-4 after:h-px after:w-[calc(100%-2rem)] after:origin-left after:scale-x-0 after:bg-secondary after:transition-transform after:duration-300 hover:after:scale-x-100 data-[active=true]:after:scale-x-100",
        className,
      )}
      {...props}
    />
  );
}

export { NavLink };
