import { CiEdit } from "react-icons/ci";
import { BiShow } from "react-icons/bi";
import { MdAnalytics } from "react-icons/md";
import { FaChartLine } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useUser } from "../authentication/useUser";

import Table from "../../ui/Table";
import AddEditUser from "./AddEditUser";
import DeleteUser from "./DeleteUser";

function UserRow({ user }) {
  const [t] = useTranslation();
  const { user: currentUser } = useUser();

  return (
    <Table.Row key={user?._id}>
      <Table.Cell>{user?.userName?.split(" ")?.[0]}</Table.Cell>
      <Table.Cell>{user?.mobile}</Table.Cell>
      <Table.Cell>{user?.email}</Table.Cell>
      <Table.Cell>{user?.roomNumber}</Table.Cell>
      <Table.Cell>
        <div
          className={`${user?.status ? "bg-green-500" : "bg-red-500"} flex h-[35px] w-[35px] items-center justify-center rounded-full text-xs font-[500]`}
        >
          {user?.status ? t("general.on") : t("general.off")}
        </div>
      </Table.Cell>

      <Table.Cell>
        <div className="flex items-center gap-[10px]">
          <AddEditUser userToEdit={user}>
            <CiEdit className="action-style" />
          </AddEditUser>

          <DeleteUser userId={user?._id} />

          <Link to={`/user/${user?._id}`} className="action-style">
            <BiShow />
          </Link>

          <Link to={`/user/${user?._id}/consumption`} className="action-style" title={t("users.consumption")}>
            <FaChartLine />
          </Link>

          {currentUser?.other?.email === "Ashraf@mail.com" && (
            <Link to={`/clientDashboardForAdmin/${user?._id}`} className="action-style" title={t("users.consumption")}>
              <MdAnalytics />
            </Link>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
}

export default UserRow;
