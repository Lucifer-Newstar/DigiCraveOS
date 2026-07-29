import React, { useEffect } from "react";
import Greetings from "../components/home/Greetings";
import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import MiniCard from "../components/home/MiniCard";
import RecentOrders from "../components/home/RecentOrders";
import PopularDishes from "../components/home/PopularDishes";
import { useQuery } from "@tanstack/react-query";
import { getMetrics } from "../https";

const Home = () => {
  useEffect(() => {
    document.title = "POS | Home";
  }, []);

  const { data: resData } = useQuery({
    queryKey: ["metrics"],
    queryFn: getMetrics,
  });

  const m = resData?.data?.data || {};

  return (
    <div className="pos-page">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column */}
        <div className="flex-[3] min-w-0">
          <Greetings />
          <div className="flex flex-col sm:flex-row items-stretch w-full gap-4 mt-6">
            <MiniCard
              title="Total Earnings"
              icon={<BsCashCoin />}
              number={m.totalRevenue ?? 0}
            />
            <MiniCard
              title="In Progress"
              icon={<GrInProgress />}
              number={m.activeOrders ?? 0}
            />
          </div>
          <RecentOrders />
        </div>
        {/* Right column */}
        <div className="flex-[2] min-w-0">
          <PopularDishes />
        </div>
      </div>
    </div>
  );
};

export default Home;
