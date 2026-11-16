import { useNavigate } from "react-router-dom";
import { CiUser } from "react-icons/ci";
import { useUser } from "../../features/authentication/useUser";
import { useTranslation } from "react-i18next";

import DarkModeToggle from "../DarkModeToggle";
import TranslationButton from "./TranslationButton";
import ToggleSidebar from "./ToggleSidebar";

function Header({ toggleSidebar }) {
  const [t] = useTranslation();
  const navigate = useNavigate();
  const { type } = useUser();

  return (
    <header className="flex h-[70px] items-center justify-between bg-secondary px-[10px] shadow-lg md:px-[20px]">
      <div className="flex items-center gap-[10px] md:gap-[20px]">
        <ToggleSidebar toggleSidebar={toggleSidebar} />
      </div>
      <div className="flex items-center justify-center gap-[10px] md:gap-[20px]">
        <TranslationButton />
        <DarkModeToggle />

        {type && (
          <div
            title={t("descriptions.adminIcon")}
            className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-primary hover:text-colorBrand"
            onClick={() => navigate("/account")}
          >
            <CiUser />
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
