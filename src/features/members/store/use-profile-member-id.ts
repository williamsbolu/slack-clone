import { useQueryState } from "nuqs";

// * What this package nuqs does is to synchronize a state to the url with live updates.

export const useProfileMemberId = () => {
  return useQueryState("profileMemberId");
};
