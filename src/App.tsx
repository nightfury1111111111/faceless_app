import React, { FC, createContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { loadLocalStorage, profile, saveToLocalStorage } from "./utils/store";
import Profile from "./containers/profile";

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
  const [user, setUser] = useAtom(profile);
  console.log("REACT_APP_SERVER_URL", process.env.REACT_APP_SERVER_URL);

  useEffect(() => {
    setUser(loadLocalStorage("user"));

    return () => {
      saveToLocalStorage("user", user);
    };
  }, []);

  return (
    <WalletContextProvider solanaNetwork={solanaNetwork}>
      <LanguageContext.Provider
        value={{ language: language, setLanguage: setLanguage }}
      >
        <BrowserRouter>
          <div className="w-full bg-secondary font-['Roboto'] text-[#FFFFFF]">
            <div className=" fixed left-0 top-0 w-full h-[30px] bg-[#7791a2] text-[9px] sm:text-[12px] text-[#000000] flex items-center justify-center z-10">
              {" "}
              This application is still in BETA.{" "}
              <span className="font-bold ml-[5px]">
                {" "}
                Fees have been set to 0% until launch.
              </span>
            </div>
            <Sidebar />

            <div className="overflow-auto page-wrapper">
              <Header solanaNetwork={solanaNetwork} />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
              <ToastContainer />
            </div>
          </div>
        </BrowserRouter>
      </LanguageContext.Provider>
    </WalletContextProvider>
  );
};

export default App;
