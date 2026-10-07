import { useSearchParams } from "react-router-dom";
import { restaurantService } from "../services/restaurant.service";
import { useFetch } from "./hooks";

// Restaurant admin ka apna restaurant. Super admin ?restaurant=ID se kisi bhi restaurant ko manage kar sakta hai.
export function useMyRestaurant() {
  const [sp] = useSearchParams();
  const forced = sp.get("restaurant");
  const q = useFetch(async () => {
    if (forced) return restaurantService.get(forced);
    const d = await restaurantService.mine();
    return d?.items?.[0] || null;
  }, [forced]);
  return { ...q, restaurant: q.data };
}
