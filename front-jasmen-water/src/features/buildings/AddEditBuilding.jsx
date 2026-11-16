import Modal from "../../ui/Modal";
import CreateBuildingForm from "./CreateBuildingForm";

function AddEditBuilding({ children, buildingToEdit }) {
  return (
    <Modal>
      <Modal.Open opens="buildingForm">{children}</Modal.Open>

      <Modal.Window name="buildingForm">
        <CreateBuildingForm buildingToEdit={buildingToEdit} />
      </Modal.Window>
    </Modal>
  );
}

export default AddEditBuilding;
