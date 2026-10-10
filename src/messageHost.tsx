import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { isUnread, watchChats } from "./messages";

// How many conversations have a message you haven't read.
export function useUnreadChats() {
  const { user } = useAuth();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!user) { setN(0); return; }
    return watchChats(user.uid, (cs) => setN(cs.filter((c) => isUnread(c, user.uid)).length));
  }, [user?.uid]);
  return n;
}
