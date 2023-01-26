import React, {
  Component,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import useWindowSize from "../../utils/useWindowSize";
import useOutsideClick from "../../utils/useOutsideClick";
import { useAtom } from "jotai";
import { dashboardStage } from "../../utils/store";

const Footer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const size = useWindowSize();
  // const navigate = useNavigate();
  const [, setStage] = useAtom(dashboardStage);

  useEffect(() => {
    if (size.width < 1024) setIsMobile(true);
    else setIsMobile(false);
  }, [size]);

  const goToDashboard = () => {
    // navigate("/");
    setStage(0);
  }

  return (
    // <div className="w-full bg-[#7C98A9]">
    //   <div className="w-[85vw] h-[77px] m-auto text-[#FFFFFF] flex justify-between items-center">
    //     <div className="font-['Roboto'] font-[800] text-[26px] leading-[30px]">
    //       Copyright © 2022
    //     </div>
    //     <div className="font-['Roboto'] font-[800] text-[26px] leading-[30px]">
    //       Privacy Policy
    //     </div>
    //   </div>
    // </div>

    <div className="absolute bottom-0 h-[3rem] bg-primary w-full flex justify-center items-center">
      <p className="text-white text-[14px] cursor-pointer" onClick={goToDashboard}>Developed by Faceless Labs @ {new Date().getFullYear()}</p>
    </div>
  );
};

export default Footer;
