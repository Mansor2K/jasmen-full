import { useTranslation } from "react-i18next";
import { IoLogOut } from "react-icons/io5";
import { useLogout } from "../../features/authentication/useLogout";
import { useUser } from "../../features/authentication/useUser";

import Modal from "../Modal";
import ConfirmMessage from "../ConfirmMessage";

function LogoutOutBtn() {
  const [t] = useTranslation();
  const { id } = useUser();
  const { logout, isLoading } = useLogout();

  return (
    <Modal>
      <Modal.Open opens="productConfirm">
        <li className="cursor-pointer">
          <div className="flex items-center gap-[15px] rounded-md bg-primary p-[13px] text-lg">
            <IoLogOut />
            <span>{t("sidebar.logout")}</span>
          </div>
        </li>
      </Modal.Open>

      <Modal.Window name="productConfirm">
        <ConfirmMessage
          disabled={isLoading}
          message={t("general.logoutMessage")}
          onConfirm={() => logout(id)}
        />
      </Modal.Window>
    </Modal>
  );
}

export default LogoutOutBtn;
