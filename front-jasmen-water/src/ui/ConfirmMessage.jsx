import { useTranslation } from "react-i18next";
import Button from "./Button";

function ConfirmMessage({ onConfirm, message, disabled, onCloseModal }) {
  const [t] = useTranslation();

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onCloseModal?.();
    } catch (error) {
      console.error("Error confirming action:", error);
    }
  };

  return (
    <div className="ga-[1.2rem] flex flex-col p-[20px] text-textColor">
      <p className="mb-[1.2rem]">{message}</p>

      <div className="flex justify-end gap-[1.2rem]">
        <Button disabled={disabled} onClick={handleConfirm}>
          {t("general.yes")}
        </Button>
        <Button
          variation="secondary"
          onClick={onCloseModal}
          disabled={disabled}
        >
          {t("general.cancel")}
        </Button>
      </div>
    </div>
  );
}

export default ConfirmMessage;
