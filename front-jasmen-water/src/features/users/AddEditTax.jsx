import Modal from "../../ui/Modal";
import AddTaxForm from "./AddTaxForm";

function AddEditTax({ children, taxToEdit }) {
  return (
    <Modal>
      <Modal.Open opens="AddTax">{children}</Modal.Open>

      <Modal.Window name="AddTax">
        <AddTaxForm taxToEdit={taxToEdit} />
      </Modal.Window>
    </Modal>
  );
}

export default AddEditTax;
