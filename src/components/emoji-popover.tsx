import { useState } from "react";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EmojiPopoverProps {
  children: React.ReactNode;
  hint?: string;
  onEmojiSelect: (emoji: any) => void;
}

export const EmojiPopover = ({
  children,
  hint = "Emoji",
  onEmojiSelect,
}: EmojiPopoverProps) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const onSelect = (value: EmojiClickData) => {
    // For emoji emoji=picker-react package
    onEmojiSelect(value.emoji);

    setPopoverOpen(false);

    setTimeout(() => {
      // close the tooltip after 500ms incase it dosen't close sometimes
      setTooltipOpen(false);
    }, 500);
  };

  // const onSelectPicker = (value: any) => {
  //   // For emoji emoji=picker-react package
  //   onEmojiSelect(value.native);

  //   setPopoverOpen(false);

  //   setTimeout(() => {
  //     // close the tooltip after 500ms incase it dosen't close sometimes
  //     setTooltipOpen(false);
  //   }, 500);
  // };

  return (
    <TooltipProvider>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <Tooltip
          open={tooltipOpen}
          onOpenChange={setTooltipOpen}
          delayDuration={50}
        >
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
          </PopoverTrigger>
          <TooltipContent className="bg-black text-white border border-white/5">
            <p className="font-medium text-xs">{hint}</p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent className="p-0 w-full border-none shadow-none">
          {/* <Picker
            data={data}
            onEmojiSelect={onSelectPicker}
            // onEmojiSelect={(x: any) => {
            //   console.log(x);
            // }}
          /> */}

          {/* Another emoji package */}
          <EmojiPicker onEmojiClick={onSelect} />
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  );
};
