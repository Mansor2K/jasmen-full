import Modal from "../../ui/Modal";
import CreateUserForm from "./CreateUserForm";

function AddEditRoom({ children, userToEdit }) {
  return (
    <Modal>
      <Modal.Open opens="userForm">{children}</Modal.Open>

      <Modal.Window name="userForm">
        <CreateUserForm userToEdit={userToEdit} />
      </Modal.Window>
    </Modal>
  );
}

export default AddEditRoom;
