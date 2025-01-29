import Quill, { type QuillOptions } from "quill";
import { Delta, Op } from "quill/core";
import {
  MutableRefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { PiTextAa } from "react-icons/pi";
import { MdSend } from "react-icons/md";
import { ImageIcon, Smile, XIcon } from "lucide-react";

import "quill/dist/quill.snow.css";
import { Button } from "./ui/button";
import { Hint } from "./hint";
import { cn } from "@/lib/utils";
import { EmojiPopover } from "./emoji-popover";
import Image from "next/image";

type EditorValue = {
  image: File | null;
  body: string;
};

interface EditorProps {
  variant?: "create" | "update"; // options for creating a message and editing a message
  placeHolder?: string;
  defaultValue?: Delta | Op[];
  disabled?: boolean;
  innerRef?: MutableRefObject<Quill | null>;
  onCancel?: () => void;
  onSubmit: ({ image, body }: EditorValue) => void;
}

const Editor = ({
  variant = "create",
  placeHolder = "Write Something...",
  defaultValue = [],
  disabled = false,
  innerRef,
  onSubmit,
  onCancel,
}: EditorProps) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null); // pt 2: 15mins
  const [isToolBarVisible, setIsToolBarVisible] = useState(true);

  // 7hour: 56:30mins We relied on ref to store this values below becus: refs do not have to be added to dependency array and they don't cause re-renders. e.g this way we would be able to call the function onSubmit inside useffect without passing it as a dependency to the useeffect
  const submitRef = useRef(onSubmit);
  const placeHolderRef = useRef(placeHolder);
  const quillRef = useRef<Quill | null>(null);
  const defaultValueRef = useRef(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);
  const disabledRef = useRef(disabled);
  const imageElementRef = useRef<HTMLInputElement | null>(null);

  useLayoutEffect(() => {
    submitRef.current = onSubmit;
    placeHolderRef.current = placeHolder;
    defaultValueRef.current = defaultValue;
    disabledRef.current = disabled;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialise Quill
    const container = containerRef.current;
    const editor = container.appendChild(
      container.ownerDocument.createElement("div")
    );

    const options: QuillOptions = {
      theme: "snow",
      placeholder: placeHolderRef.current,
      modules: {
        toolbar: [
          ["bold", "italic", "strike"],
          ["link"],
          [{ list: "ordered" }, { list: "bullet" }],
        ], // Quill toolbar options
        keyboard: {
          bindings: {
            // Disable the return key from creating a new line instead it should submit the form
            enter: {
              key: "Enter",
              handler: () => {
                //  Submit the form
                const text = quill.getText();
                const addedImage = imageElementRef.current?.files?.[0] || null;

                // If the user has not added an image and the text is empty, we should not submit the form
                const isEmpty =
                  !addedImage &&
                  text.replace(/<(.|\n)*?>/g, "").trim().length === 0;

                if (isEmpty) return;

                const body = JSON.stringify(quill.getContents()); // we dont have to use the quillRef because we have access to the quill instance here on the effect
                submitRef.current({ image: addedImage, body }); // used ref values to avoid adding the function to the dependency array
              },
            },
            shift_enter: {
              key: "Enter",
              shiftKey: true, // Shift + Enter
              handler: () => {
                quill.insertText(quill.getSelection()?.index || 0, "\n");
              },
            },
          },
        },
      },
    };

    const quill = new Quill(editor, options);
    quillRef.current = quill; // pass the quill initialization to our ref so we can access it anywhere in the component outside the effect
    quillRef.current.focus(); // focus the browser on the quill editor

    // To control the quill from outside the component
    if (innerRef) {
      innerRef.current = quill;
    }

    quill.setContents(defaultValueRef.current);
    setText(quill.getText());

    quill.on(Quill.events.TEXT_CHANGE, () => {
      setText(quill.getText());
    });

    // Important: for clean up incase useffect is called twice: 7hour: 37mins
    return () => {
      quill.off(Quill.events.TEXT_CHANGE);
      if (container) {
        container.innerHTML = "";
      }
      if (quillRef.current) {
        quillRef.current = null;
      }
      if (innerRef) {
        innerRef.current = null;
      }
    };
  }, [innerRef]);

  const toggleToolbar = () => {
    setIsToolBarVisible((current) => !current);
    const toolbarElement = containerRef.current?.querySelector(".ql-toolbar");

    if (toolbarElement) {
      toolbarElement.classList.toggle("hidden");
    }
  };

  const onEmojiSelect = (emojiValue: string) => {
    // console.log(emoji);
    const quill = quillRef.current;

    // insert the emoji at the current cursor position: (the last character position or we fall back to the first position if we don't have an index)
    console.log(quill?.getSelection()?.index);

    quill?.insertText(quill?.getSelection()?.index || 0, emojiValue);
  };

  const isEmpty = !image && text.replace(/<(.|\n)*?>/g, "").trim().length === 0; // Regex remove empty html elements

  return (
    <div className="flex flex-col">
      <input
        type="file"
        accept="image/*"
        ref={imageElementRef}
        // when an image is selected, we set the image state to the selected image
        onChange={(event) => setImage(event.target.files![0])}
        className="hidden"
      />
      <div
        className={cn(
          "flex flex-col border border-slate-200 rounded-md overflow-hidden focus-within:border-slate-300 focus-within:shadow-sm transition bg-white",
          disabled && "opacity-50"
        )}
      >
        <div ref={containerRef} className="h-full ql-custom" />
        {!!image && (
          <div className="p-2">
            <div className="relative size-[62px] flex items-center justify-center group/image">
              <Hint label="Remove image">
                <button
                  onClick={() => {
                    setImage(null);
                    imageElementRef.current!.value = "";
                  }}
                  className="hidden group-hover/image:flex rounded-full bg-black/70 hover:bg-black absolute -top-2.5 -right-2.5 text-white size-6 z-[4] border-2 border-white items-center justify-center"
                >
                  <XIcon className="size-3.5" />
                </button>
              </Hint>
              <Image
                src={URL.createObjectURL(image)}
                alt="uploaded"
                fill
                className="rounded-xl overflow-hidden border object-cover"
              />
            </div>
          </div>
        )}
        <div className="flex px-2 pb-2 z-[5]">
          <Hint
            label={isToolBarVisible ? "Hide formatting" : "Show formatting"}
          >
            <Button
              disabled={disabled}
              size={"iconSm"}
              variant="ghost"
              onClick={toggleToolbar}
            >
              <PiTextAa className="size-4" />
            </Button>
          </Hint>

          <EmojiPopover onEmojiSelect={onEmojiSelect}>
            <Button disabled={disabled} size={"iconSm"} variant="ghost">
              <Smile className="size-4" />
            </Button>
          </EmojiPopover>

          {variant === "create" && (
            <Hint label="Image">
              <Button
                disabled={disabled}
                size={"iconSm"}
                variant="ghost"
                onClick={() => {
                  // pt 2: 17mins
                  imageElementRef.current?.click();
                }}
              >
                <ImageIcon className="size-4" />
              </Button>
            </Hint>
          )}

          {variant === "update" && (
            <div className="ml-auto flex items-center gap-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                disabled={disabled}
              >
                Cancel
              </Button>
              <Button
                disabled={disabled || isEmpty}
                size="sm"
                className="ml-auto bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
                onClick={() =>
                  onSubmit({
                    body: JSON.stringify(quillRef.current?.getContents()),
                    image,
                  })
                }
              >
                Save
              </Button>
            </div>
          )}

          {variant === "create" && (
            <Button
              disabled={disabled || isEmpty}
              onClick={() =>
                onSubmit({
                  body: JSON.stringify(quillRef.current?.getContents()),
                  image,
                })
              }
              size="iconSm"
              className={cn(
                "ml-auto",
                isEmpty
                  ? "bg-white hover:bg-white text-muted-foreground"
                  : "bg-[#007a5a] hover:bg-[#007a5a]/80 text-white"
              )}
            >
              <MdSend className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {variant === "create" && (
        <div
          className={cn(
            "p-2 text-[10px] text-muted-foreground flex justify-end opacity-0",
            !isEmpty && "opacity-100"
          )}
        >
          <p>
            <strong>Shift + Return</strong> to add a new line
          </p>
        </div>
      )}
    </div>
  );
};

export default Editor;

// 7hour: 31min

// Quill dosent support server side rendering, so we have to import this components dynamically where we want to use it so it doesnt get rendered on the server side
