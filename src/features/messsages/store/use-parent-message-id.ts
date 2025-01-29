import { useQueryState } from "nuqs";

// * What this package nuqs does is to synchronize a state to the url with live updates.

export const useParentMessageId = () => {
  return useQueryState("parentMessageId");
};

// pt-2 3hour: 48mins
