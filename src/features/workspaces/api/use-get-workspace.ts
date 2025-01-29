import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface useGetWorkspaceProps {
  id: Id<"workspaces">;
}

export const useGetWorkspace = ({ id }: useGetWorkspaceProps) => {
  const data = useQuery(api.workspaces.getById, { id });

  // undefined meaning loading
  const isLoading = data === undefined;

  return {
    data,
    isLoading,
  };
};

// 2hour 50mins: Creation of the useGetWorkspace hook

// Note: useGetWorkspace hook, (the data fetch by the useQuery hook) is actually cached by whichever where its called first on our codebase, so any
// So any Subsequent calls would not actually be calls but more like a global state which is stored until convex detects a change on the backend and it would
// automatically updates it in all places: So it can be used in multiple places without any performance issues :: 3hour 3min
