import { useTranslation } from "react-i18next";
import { useUpdateUser } from "./useUpdateUser";

import ConfirmMessage from "../../ui/ConfirmMessage";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

function CloseValve({ userData, socket }) {
  const [t] = useTranslation();
  const { isUpdating, updateUser } = useUpdateUser();

  const handleOpenValve = () => {
    updateUser(
      {
        id: userData?._id,
        data: {
          status: false,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("users.valveClosed"));

          socket.emit("SendStatusClose", {
            userId: userData?._id,
            state: false,
          });
        },
        onError: () => {
          toast.error(t("users.updateFailed"));
        },
      },
    );
  };

  return (
    <Modal>
      <Modal.Open opens="closeValve">
        <div title={t("descriptions.closeValve")} className="w-[120px]">
          <Button disabled={userData?.status === false} variation="secondary">
            {t("users.closeValveAction")}
          </Button>
        </div>
      </Modal.Open>

      <Modal.Window name="closeValve">
        <ConfirmMessage
          disabled={isUpdating}
          message={t("users.closeValve")}
          onConfirm={handleOpenValve}
          onCloseModal={true}
        />
      </Modal.Window>
    </Modal>
  );
}

export default CloseValve;
