import { useDarkMode } from "../context/DarkModeContext";
import { LuSun } from "react-icons/lu";
import { FaRegMoon } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function DarkModeToggle() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [t] = useTranslation();
  return (
    <div
      title={t("descriptions.toggleLightAndDark")}
      onClick={toggleDarkMode}
      className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-primary hover:text-colorBrand"
    >
      {isDarkMode ? <LuSun /> : <FaRegMoon />}
    </div>
  );
}

export default DarkModeToggle;
