import { useTranslation } from "react-i18next";
import { AiOutlineDelete } from "react-icons/ai";
import { useDeleteTax } from "./useDeleteTax";
import { useParams } from "react-router-dom";

import Modal from "../../ui/Modal";
import ConfirmMessage from "../../ui/ConfirmMessage";
import toast from "react-hot-toast";

function DeleteTax({ taxId }) {
  const { id } = useParams();
  const [t] = useTranslation();
  const { isDeleting, deleteTax } = useDeleteTax();

  const handleDeleteUser = () => {
    deleteTax(
      { id, taxId },
      {
        onSuccess: () => {
          toast.success(t("users.deletedTaxSuccessfully"));
        },
        onError: () => {
          toast.error(t("users.deletedTaxFailed"));
        },
      },
    );
  };

  return (
    <Modal>
      <Modal.Open opens="DeleteTax">
        <button
          className={`action-style ${isDeleting ? "cursor-not-allowed" : ""}`}
          disabled={isDeleting}
        >
          <AiOutlineDelete />
        </button>
      </Modal.Open>

      <Modal.Window name="DeleteTax">
        <ConfirmMessage
          disabled={isDeleting}
          message={t("users.deleteTaxMessage")}
          onConfirm={handleDeleteUser}
        />
      </Modal.Window>
    </Modal>
  );
}

export default DeleteTax;
