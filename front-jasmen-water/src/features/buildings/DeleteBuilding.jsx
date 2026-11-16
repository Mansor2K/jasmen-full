import { useTranslation } from "react-i18next";
import { AiOutlineDelete } from "react-icons/ai";
import { useDeleteBuilding } from "./useDeleteBuilding";

import Modal from "../../ui/Modal";
import ConfirmMessage from "../../ui/ConfirmMessage";
import toast from "react-hot-toast";

function DeleteBuilding({ buildingId }) {
  const [t] = useTranslation();
  const { isDeleting, deleteBuilding } = useDeleteBuilding();

  const handleDeleteBuilding = () => {
    deleteBuilding(
      { id: buildingId },
      {
        onSuccess: () => {
          toast.success(t("buildings.deletedSuccessfully"));
        },
        onError: () => {
          toast.error(t("buildings.deletedFailed"));
        },
      },
    );
  };

  return (
    <Modal>
      <Modal.Open opens="deleteBuilding">
        <button
          className={`p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 transform ${isDeleting ? "cursor-not-allowed opacity-50" : ""}`}
          disabled={isDeleting}
        >
          <AiOutlineDelete className="text-sm" />
          <span className="sr-only">{t("buildings.deleteBuilding")}</span>
        </button>
      </Modal.Open>

      <Modal.Window name="deleteBuilding">
        <ConfirmMessage
          disabled={isDeleting}
          message={t("buildings.deleteMessage")}
          onConfirm={handleDeleteBuilding}
        />
      </Modal.Window>
    </Modal>
  );
}

export default DeleteBuilding;
