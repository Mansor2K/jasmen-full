import { CiEdit } from "react-icons/ci";
import { BiShow } from "react-icons/bi";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Table from "../../ui/Table";
import AddEditBuilding from "./AddEditBuilding";
import DeleteBuilding from "./DeleteBuilding";
import { baseURL } from "../../services/axios";

function BuildingRow({ building }) {
  const [t] = useTranslation();

  return (
    <Table.Row key={building?._id}>
      <Table.Cell>
        {building?.buildingLogo ? (
          <img
            src={`${baseURL}${building.buildingLogo}`}
            alt={`${building.buildingName} logo`}
            className="h-12 w-12 rounded-lg object-cover border-2 border-gray-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`h-12 w-12 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs ${building?.buildingLogo ? 'hidden' : 'flex'}`}
        >
          {t("buildings.noImage")}
        </div>
      </Table.Cell>
      <Table.Cell>{building?.buildingName}</Table.Cell>
      <Table.Cell>{building?.buildingAddress || "-"}</Table.Cell>
      <Table.Cell>{building?.buildingCode || "-"}</Table.Cell>
      <Table.Cell>
        <div className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-blue-500 text-xs font-[500] text-white">
          {building?.userCount || 0}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="max-w-[200px] truncate">
          {building?.buildingDescription || "-"}
        </div>
      </Table.Cell>

      <Table.Cell>
        <div className="flex items-center gap-[10px]">
          <AddEditBuilding buildingToEdit={building}>
            <CiEdit className="action-style" />
          </AddEditBuilding>

          <DeleteBuilding buildingId={building?._id} />

          <Link to={`/building/${building?._id}`} className="action-style">
            <BiShow />
          </Link>
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export default BuildingRow;
