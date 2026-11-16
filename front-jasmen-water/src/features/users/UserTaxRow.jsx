import { CiEdit } from "react-icons/ci";
import Table from "../../ui/Table";
import AddEditTax from "./AddEditTax";
import DeleteTax from "./DeleteTax";

function UserTaxRow({ singleTax }) {
  return (
    <Table.Row key={singleTax?._id}>
      <Table.Cell>{singleTax?.reason}</Table.Cell>
      <Table.Cell>{singleTax?.value}</Table.Cell>
      <Table.Cell>
        <div className="flex items-center gap-[10px]">
          <AddEditTax taxToEdit={singleTax}>
            <CiEdit className="action-style" />
          </AddEditTax>

          <DeleteTax taxId={singleTax?._id} />
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export default UserTaxRow;
