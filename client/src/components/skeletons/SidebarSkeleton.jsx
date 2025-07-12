import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  return (
    <aside className="bg-base-200 h-full w-20 lg:w-72 border-r border-base-300 flex flex-col animate-pulse">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6 text-base-content/50" />
          <span className="font-medium hidden lg:block w-24 h-4 bg-base-300 rounded" />
        </div>
      </div>

      <div className="overflow-y-auto w-full">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-full p-3 flex items-center gap-3 rounded hover:bg-base-300 transition-colors"
          >
            <div className="relative mx-auto lg:mx-0">
              <div className="size-12 bg-base-300 rounded-full" />
            </div>

            <div className="hidden lg:block flex-1 space-y-1">
              <div className="h-4 bg-base-300 rounded w-32" />
              <div className="h-3 bg-base-300 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
