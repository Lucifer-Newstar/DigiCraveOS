import React from "react";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getPopularDishes } from "../../https";
import { popularDishes as seedDishes } from "../../constants";

// Reuse the seed dish images as thumbnails when a name matches.
const imageByName = seedDishes.reduce((map, dish) => {
  map[dish.name.toLowerCase()] = dish.image;
  return map;
}, {});

const PopularDishes = () => {
  const { data: resData, isError } = useQuery({
    queryKey: ["popular-dishes"],
    queryFn: getPopularDishes,
  });

  if (isError) {
    enqueueSnackbar("Failed to load popular dishes!", { variant: "error" });
  }

  const dishes = resData?.data?.data || [];

  return (
    <div className="pos-card h-full flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100">
        <h1 className="text-slate-900 text-lg font-bold">Popular Dishes</h1>
      </div>

      <div className="overflow-y-auto scrollbar-hide flex-1 p-3">
        {dishes.length === 0 ? (
          <p className="text-slate-500 text-sm px-3 py-4">
            No orders yet — popular dishes will appear here.
          </p>
        ) : (
          dishes.map((dish, index) => {
            const rank = index + 1;
            const image = imageByName[dish.name?.toLowerCase()];
            return (
              <div
                key={dish.name}
                className="flex items-center gap-4 rounded-xl px-3 py-3 hover:bg-slate-50 transition-colors"
              >
                <span className="text-slate-400 font-bold text-sm w-6 text-center">
                  {rank < 10 ? `0${rank}` : rank}
                </span>
                {image ? (
                  <img
                    src={image}
                    alt={dish.name}
                    className="w-[46px] h-[46px] rounded-full object-cover"
                  />
                ) : (
                  <div className="w-[46px] h-[46px] rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    {dish.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-slate-900 font-semibold truncate">
                    {dish.name}
                  </h1>
                  <p className="text-slate-500 text-sm mt-0.5">
                    <span className="text-slate-400">Orders: </span>
                    {dish.numberOfOrders}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PopularDishes;
