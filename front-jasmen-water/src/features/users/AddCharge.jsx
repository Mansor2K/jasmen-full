import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import AddChargeFrom from "./AddChargeFrom";

function AddCharge({ user, socket }) {
  const [t] = useTranslation();

  return (
    <Modal>
      <Modal.Open opens="AddCharge">
        <div
          title={t("descriptions.addCharge")}
          className="ltr:w-[120px] rtl:w-[130px]"
        >
          <Button>{t("users.addCharge")}</Button>
        </div>
      </Modal.Open>

      <Modal.Window name="AddCharge">
        <AddChargeFrom user={user} socket={socket} />
      </Modal.Window>
    </Modal>
  );
}

export default AddCharge;
