import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import UserBill from "./UserBill";

function ShowBill({ user }) {
  const [t] = useTranslation();

  return (
    <Modal>
      <Modal.Open opens="ShowBill">
        <div
          title={t("descriptions.showBill")}
          className="ltr:w-[120px] rtl:w-[130px]"
        >
          <Button>{t("users.showBill")}</Button>
        </div>
      </Modal.Open>

      <Modal.Window name="ShowBill">
        <UserBill user={user} />
      </Modal.Window>
    </Modal>
  );
}

export default ShowBill;
