import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCustomerProfile } from "../https";
import { setCustomer, clearCustomer } from "../redux/slices/customerAuthSlice";

// Revalidates the Guest session in the background. Same non-blocking pattern as
// the staff useLoadData so the customer site never flashes/blanks on refresh.
const useCustomerAuth = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.customerAuth.isAuth);
  const [isLoading, setIsLoading] = useState(!isAuth);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await getCustomerProfile();
        if (active) dispatch(setCustomer(data.data));
      } catch {
        if (active) dispatch(clearCustomer());
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [dispatch]);

  return isLoading;
};

export default useCustomerAuth;
