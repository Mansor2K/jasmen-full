import { jwtDecode } from "jwt-decode";
import { useTranslation } from "react-i18next";

function UserPersonalData({ user, id, state }) {
  const [t] = useTranslation();
  let user2 = localStorage.getItem("WATER_USER_TOKEN")
  let userdecoded = jwtDecode(user2)
  return (
    <div className="flex h-[380px] flex-col gap-[10px] rounded-md bg-secondary p-[10px]">
      {userdecoded?._id === "66fad02978e3108b369748de" && (
        <p className="flex items-center bg-primary p-[8px]">
          {t("general.id")}: {id}
        </p>
      )}

      <p className="flex items-center bg-primary p-[8px]">
        {t("general.name")}: {user?.userName}
      </p>

      <p className="flex items-center bg-primary p-[8px]">
        {t("general.email")}: {user?.email}
      </p>

      <p className="flex items-center bg-primary p-[8px]">
        {t("users.limit")}: {user?.limit}
      </p>

      <p className="flex items-center bg-primary p-[8px]">
        {t("users.mobile")}: {user?.mobile}
      </p>

      <p className="flex items-center bg-primary p-[8px]">
        {t("users.roomNumber")}: {user?.roomNumber}
      </p>

      {state !== null ? (
        <p className="flex items-center bg-primary p-[8px]">
          {t("users.status")}:{" "}
          {state === true && (
            <span className="rounded-full bg-green-500 p-[5px] text-sm ltr:ml-[10px] rtl:mr-[10px]">
              {t("general.on")}
            </span>
          )}
          {state === false && (
            <span className="rounded-full bg-red-500 p-[5px] text-sm ltr:ml-[10px] rtl:mr-[10px]">
              {t("general.off")}
            </span>
          )}
        </p>
      ) : (
        <p className="flex items-center bg-primary p-[8px]">
          {t("users.status")}:{" "}
          {user?.status === true && (
            <span className="rounded-full bg-green-500 p-[5px] text-sm ltr:ml-[10px] rtl:mr-[10px]">
              {t("general.on")}
            </span>
          )}
          {user?.status === false && (
            <span className="rounded-full bg-red-500 p-[5px] text-sm ltr:ml-[10px] rtl:mr-[10px]">
              {t("general.off")}
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export default UserPersonalData;
