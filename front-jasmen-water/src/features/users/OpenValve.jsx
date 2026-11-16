import { useTranslation } from "react-i18next";
import { useUpdateUser } from "./useUpdateUser";

import ConfirmMessage from "../../ui/ConfirmMessage";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

function OpenValve({ userData, socket }) {
  const [t] = useTranslation();
  const { isUpdating, updateUser } = useUpdateUser();

  function handleOpenValve() {
    updateUser(
      {
        id: userData?._id,
        data: {
          status: true,
        },
      },
      {
        onSuccess: () => {
          toast.success(t("users.valveOpened"));

          socket.emit("SendStatusClose", {
            userId: userData?._id,
            state: true,
          });
        },
        onError: () => {
          toast.error(t("users.updateFailed"));
        },
      },
    );
  }

  return (
    <Modal>
      <Modal.Open opens="OpenValve">
        <div title={t("descriptions.openValve")} className="w-[120px]">
          <Button disabled={userData?.status === true}>
            {t("users.openValveAction")}
          </Button>
        </div>
      </Modal.Open>

      <Modal.Window name="OpenValve">
        <ConfirmMessage
          disabled={isUpdating}
          message={t("users.openValve")}
          onConfirm={handleOpenValve}
        />
      </Modal.Window>
    </Modal>
  );
}

export default OpenValve;
