"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { Loader } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [open, setOpen] = useCreateWorkspaceModal();

  const { data, isLoading } = useGetWorkspaces();

  const workspageId = useMemo(() => data?.[0]?._id, [data]);

  useEffect(() => {
    if (isLoading) return;

    if (workspageId) {
      router.replace(`/workspace/${workspageId}`);
    } else if (!open) {
      setOpen(true);
    }
  }, [workspageId, isLoading, open, setOpen, router]);

  return (
    <div className="h-full flex items-center justify-center">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
