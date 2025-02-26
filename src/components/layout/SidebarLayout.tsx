import { ReactNode } from "react";

export default function SidebarLayout({
  children,
  slots,
  isRightSidebarOpen = false,
  isTopBarShown = false,
  isBottomBarShown = false,
}: {
  children: ReactNode;
  slots: {
    navigation?: ReactNode;
    assetsDrawer?: ReactNode;
    rightSidebar?: ReactNode;
    topBar?: ReactNode;
    bottomBar?: ReactNode;
  };
  isRightSidebarOpen?: boolean;
  isTopBarShown?: boolean;
  isBottomBarShown?: boolean;
}) {
  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Main content */}
      {children}

      {/* Navigation + Drawer */}
      <div className="fixed bottom-0 left-0 z-20 w-full lg:top-0 lg:h-full lg:w-auto">
        <div className="flex w-full flex-col-reverse lg:h-full lg:w-auto lg:flex-row">
          <div className="z-20 border-t bg-background lg:h-full lg:border-r lg:border-t-0">
            {slots.navigation}
          </div>
          <div className="relative z-10 h-[50vh] w-full flex-shrink-0 pl-0 lg:h-full lg:w-80">
            {slots.assetsDrawer}
          </div>
        </div>
      </div>

      {/* Top bar */}
      <div className="pointer-events-none fixed left-0 top-12 z-40 w-full lg:top-0">
        <div className="mx-auto space-y-3 py-2 sm:max-w-sm xl:py-3">
          {isTopBarShown && slots.topBar}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="pointer-events-none fixed bottom-16 left-0 z-40 w-full pb-2 lg:bottom-0 lg:z-50 lg:pb-0">
        <div className="mx-auto space-y-3 py-2 sm:max-w-sm xl:py-3">
          {isBottomBarShown && slots.bottomBar}
        </div>
      </div>

      {/* Right Sidebar */}
      {isRightSidebarOpen && (
        <div className="fixed bottom-[3.825rem] right-0 top-0 z-50 flex w-96 lg:bottom-0">
          <div className="flex w-full flex-col">{slots.rightSidebar}</div>
        </div>
      )}
    </div>
  );
}
