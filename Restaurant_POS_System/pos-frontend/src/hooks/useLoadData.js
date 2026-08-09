import { useDispatch, useSelector } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";

/**
 * Validates the current session against the server on app load.
 *
 * Fixes the "flash then blank" bug:
 *  - If we already have a persisted user, we DON'T block the UI on the network
 *    call (no full-screen loader gate) — we revalidate silently in the
 *    background, so navigating between sections never blanks the screen.
 *  - On a validation error we clear the user but DO NOT navigate here. Route
 *    guards decide where to send the user, avoiding redirect races during render.
 */
const useLoadData = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.user.isAuth);
  // Only block the very first paint when there's no cached session at all.
  const [isLoading, setIsLoading] = useState(!isAuth);

  useEffect(() => {
    let active = true;
    const fetchUser = async () => {
      try {
        const { data } = await getUserData();
        if (!active) return;
        const { _id, name, email, phone, role } = data.data;
        dispatch(setUser({ _id, name, email, phone, role }));
      } catch (error) {
        if (!active) return;
        dispatch(removeUser());
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchUser();
    return () => {
      active = false;
    };
  }, [dispatch]);

  return isLoading;
};

export default useLoadData;
