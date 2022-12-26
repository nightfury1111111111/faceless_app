import React, { Component, useState, useEffect } from "react";
import { translate } from "../../utils/translate";

const Home = () => {
  const [faqNum, setFaqNum] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-dashboard-backcolor min-h-[100vh] px-[49px]">
      <div className="font-[600] text-[22px] leading-[22px] pt-[107px]">
        Dashboard
      </div>
      <div className="mt-[14px] text-[18px] leading-[21px] font-[300]">
        Overview of your escrows and performance.
      </div>
      <div className="mt-[35px] grid grid-cols-3 gap-4">
        <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[240px] p-[23px]"></div>
        <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[240px] p-[23px]"></div>
        <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[240px] p-[23px]"></div>
      </div>
      <div className="mt-[51.37px] border-[1px] border-[#7c98a9] opacity-[0.4] h-0"></div>
      <div className="mt-[35.63px] flex justify-between items-center">
        <div className="flex items-center">
          <div className="font-[600] text-[22px] leading-[26px]">
            My Escrows
          </div>
          <div className="ml-[32px] rounded-[10px] w-[115px] h-[35px] flex justify-center items-center bg-dashboard-button1-bgcolor font-[600] text-[18px] leading-[21px] cursor-pointer">
            CREATE
          </div>
        </div>
        <div className="rounded-[20px] bg-dashboard-buttonwrapper-bgcolor w-[246px] h-[42px] p-[3px] flex justify-between items-center">
          <div className="w-[115.69px] h-[35px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer">
            Active
          </div>
          <div className="w-[115.69px] h-[35px] flex justify-center items-center hover:bg-dashboard-button1-bgcolor text-[18px] leading-[22px] font-[500] rounded-[20px] cursor-pointer">
            Completed
          </div>
        </div>
      </div>
      <div className="mt-[46px] pb-[177px] grid grid-cols-3 gap-4">
        <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[215px] p-[23px]"></div>
        <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[215px] p-[23px]"></div>
        <div className="rounded-[10px] bg-dashboard-card1-bgcolor h-[215px] p-[23px]"></div>
      </div>
    </div>
  );
};
export default Home;
