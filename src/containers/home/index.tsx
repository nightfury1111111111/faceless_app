import React, { Component, useState, useEffect } from "react";
import { translate } from "../../utils/translate";

const Home = () => {
  const [faqNum, setFaqNum] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-dashboard-backcolor w-[calc(100vw-220px)] h-[100vh]"></div>
  );
};
export default Home;
