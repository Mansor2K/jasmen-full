import { useTranslation } from "react-i18next";
import Button from "../../ui/Button";
import Modal from "../../ui/Modal";
import SettingFrom from "./SettingFrom";

function UpdateSettings({ settings }) {
  const [t] = useTranslation();

  return (
    <Modal>
      <Modal.Open opens="UpdateSettings">
        <div title={t("descriptions.updateSettings")}>
          <Button>{t("settings.updateSettings")}</Button>
        </div>
      </Modal.Open>

      <Modal.Window name="UpdateSettings">
        <SettingFrom settings={settings} />
      </Modal.Window>
    </Modal>
  );
}

export default UpdateSettings;
