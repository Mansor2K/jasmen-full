import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

function PageNotFound() {
  const [t] = useTranslation();

  return (
    <div className="flex h-[100vh] items-center justify-center bg-primary text-center text-textColor">
      <div>
        <h1 className="mb-[10px]">{t("general.notFoundPage")}</h1>
        <Link to={"/"} replace>
          &larr; Go back
        </Link>
      </div>
    </div>
  );
}

export default PageNotFound;
