import Quill from "quill";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useCreateMessage } from "@/features/messsages/api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { Id } from "../../../../../../convex/_generated/dataModel";

const Editor = dynamic(() => import("@/components/editor"), {
  ssr: false,
});

interface ChatInputProps {
  placeHolder: string;
}

type CreateMessageValues = {
  channelId: Id<"channels">;
  workspaceId: Id<"workspaces">;
  body: string;
  image?: Id<"_storage"> | undefined;
};

export const ChatInput = ({ placeHolder }: ChatInputProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const [pending, setPending] = useState(false);

  const editorRef = useRef<Quill | null>(null); // we control "quill" with this ref

  const workspaceId = useWorkspaceId();
  const channelId = useChannelId();

  const { mutate: generateUploadUrl } = useGenerateUploadUrl();
  const { mutate: createMessage } = useCreateMessage();

  const handleSubmit = async ({
    body,
    image,
  }: {
    body: string;
    image: File | null;
  }) => {
    try {
      setPending(true);
      editorRef.current?.enable(false); // Disable the quill editor

      const values: CreateMessageValues = {
        channelId,
        workspaceId,
        body,
        image: undefined,
      };

      // If the user submitted an image
      if (image) {
        const url = await generateUploadUrl({}, { throwError: true });

        if (!url) {
          throw new Error("Url not found");
        }

        const result = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": image.type },
          body: image,
        });

        if (!result.ok) {
          throw new Error("Failed to upload image");
        }

        const { storageId } = await result.json();

        values.image = storageId;
      }

      await createMessage(values, { throwError: true });

      // Everytime the key changes the "editor components" will be destroyed and built again. Reseting the entire state // This is to clear the editor after submitting a message
      setEditorKey((prev) => prev + 1);
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setPending(false);
      editorRef.current?.enable(true); // enable the quill editor
    }

    // editorRef.current?.setContents([]); // another way of clearing the editor
  };

  return (
    <div className="px-5 w-full">
      <Editor
        key={editorKey}
        placeHolder={placeHolder}
        onSubmit={handleSubmit}
        disabled={pending}
        innerRef={editorRef}
      />
    </div>
  );
};

// We made the editor a default export to be imported dynamically because the package used there does not work well on server=side rendering

// innerRef is for controling the editor e.g clearing the editor after submitting a message
