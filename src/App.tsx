import React, { FC, createContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";

import { history } from "./utils/history";
// import logo from "./logo.svg";
import Header from "./components/header";
import Footer from "./components/footer";
import Home from "./containers/home";
import Sidebar from "./components/sidebar";

import WalletContextProvider from "./components/WalletContextProvider";

import "./App.css";
import "./styles.scss";
import { useAtom } from "jotai";
import {
  dashboardStage,
  isLoadingOverlay,
  loadLocalStorage,
  profile,
  saveToLocalStorage,
} from "./utils/store";
import Profile from "./containers/profile";
import LoadingOverlay from "./components/loading-overlay";

declare global {
  interface LanguageType {
    language: string;
    setLanguage: React.Dispatch<React.SetStateAction<string>>;
  } // sample code include set function
}

export type SolanaNetworkType = "mainnet-beta" | "devnet";

export const LanguageContext = createContext<LanguageType>({
  language: "english",
  setLanguage: () => {},
});

const App = () => {
  const [language, setLanguage] = useState("english");
  const [solanaNetwork] = useState<SolanaNetworkType>("devnet");
  const [isAuthorized, setAuthorized] = useState(false);
  const [user] = useAtom(profile);
  const [isLoading, setLoading] = useAtom(isLoadingOverlay);
  const [isWalletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    let isUser = user.walletAddress ? true : false;

    if (isUser !== isAuthorized) {
      setTimeout(() => {
        setAuthorized(isUser);
      }, 200);
    }
  }, [user.walletAddress]);

  const handleLoadingOverlay = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <WalletContextProvider solanaNetwork={solanaNetwork}>
      <LanguageContext.Provider
        value={{ language: language, setLanguage: setLanguage }}
      >
        <BrowserRouter>
          <div
            className={`w-full bg-secondary font-['Open Sans'] text-[#FFFFFF] ${
              isAuthorized ? "bg-secondary" : ""
            }`}
          >
            {isAuthorized ? (
              <>
                <div className=" fixed left-0 top-0 w-full h-[30px] md:h-[43px] bg-[#181D26] text-[10px] sm:text-[14px] text-[#E0E0E0] flex items-center justify-center z-10">
                  {" "}
                  This application is still in BETA.{" "}
                  <span className="font-bold ml-[5px]">
                    {" "}
                    Fees have been set to 0% until launch.
                  </span>
                </div>
              </>
            ) : (
              ""
            )}

            <div
              className={`overflow-auto relative  ${
                isAuthorized ? "page-wrapper" : ""
              }`}
            >
              <Header solanaNetwork={solanaNetwork} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
              <ToastContainer position="bottom-right" />
            </div>

            {isLoading ? <LoadingOverlay /> : ""}
          </div>
        </BrowserRouter>
      </LanguageContext.Provider>
    </WalletContextProvider>
  );
};

export default App;
