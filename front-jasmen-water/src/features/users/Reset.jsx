import { useTranslation } from "react-i18next";
import { useUpdateUser } from "./useUpdateUser";
import { useParams } from "react-router-dom";

import ConfirmMessage from "../../ui/ConfirmMessage";
import toast from "react-hot-toast";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";

function Reset({ socket }) {
  const [t] = useTranslation();

  const { id } = useParams();
  const { isUpdating, updateUser } = useUpdateUser();

  const handleOpenValve = () => {
    updateUser(
      {
        id,
        data: {
          limit: 0,
          consumption: 0,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("users.resetSuccess"));
          socket.emit("SendInitialReset", {
            userId: id,
            reset: true,
          });
        },
        onError: () => {
          toast.error(t("users.resetFailed"));
        },
      },
    );
  };

  return (
    <Modal>
      <Modal.Open opens="Reset">
        <div
          title={t("descriptions.resetUser")}
          className="ltr:w-[120px] rtl:w-[170px]"
        >
          <Button>{t("users.Reset")}</Button>
        </div>
      </Modal.Open>

      <Modal.Window name="Reset">
        <ConfirmMessage
          disabled={isUpdating}
          message={t("users.resetMessage")}
          onConfirm={handleOpenValve}
          onCloseModal={true}
        />
      </Modal.Window>
    </Modal>
  );
}

export default Reset;
