import { useSettings } from "../settings/useSettings";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaInstagramSquare } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";

import Heading from "../../ui/Heading";
import Spinner from "../../ui/spinner/Spinner";
import Empty from "../../ui/Empty";

function Contact() {
  const { isLoading, settings } = useSettings();
  const [t] = useTranslation();

  if (isLoading) return <Spinner />;
  if (!settings) return <Empty message={t("client.noContactInfo")} />;

  const { Instagram, facebook, whatsAppLink } = settings || {};

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="rounded-md bg-secondary p-[10px]">
        <Heading>{t("client.contactInfo")}</Heading>
      </div>
      <div className="flex items-center gap-[20px] bg-secondary p-[10px]">
        <Link to={facebook} target="_blank">
          <FaFacebook className="text-3xl transition-all hover:text-colorBrand" />
        </Link>
        <Link to={Instagram} target="_blank">
          <FaInstagramSquare className="text-3xl transition-all hover:text-colorBrand" />
        </Link>

        <Link to={whatsAppLink} target="_blank">
          <IoLogoWhatsapp className="text-3xl transition-all hover:text-colorBrand" />
        </Link>
      </div>
    </div>
  );
}

export default Contact;
