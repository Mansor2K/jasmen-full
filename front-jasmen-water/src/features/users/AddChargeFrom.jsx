import { useForm } from "react-hook-form";
import { useAddChargeToUser } from "./useAddChargeToUser";
import { isOnlySpaces } from "../../utils/helpers";
import { useTranslation } from "react-i18next";
import { useSettings } from "../settings/useSettings";
import { MAX_INPUT_LENGTH, NUMBER_INPUT_REGEX } from "../../utils/constants";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

function AddChargeFrom({ user, onCloseModal, socket }) {
  const { isCharging, chargeUser } = useAddChargeToUser();
  const { settings } = useSettings();
  const { meterPrice = 0 } = settings || {};

  const [t] = useTranslation();

  const { register, handleSubmit, formState, reset, watch } = useForm({
    defaultValues: { metersCount: "" },
  });
  const { errors } = formState;
  const metersCount = watch("metersCount", 0);

  function onSubmit(data) {
    chargeUser(
      {
        id: user?._id,
        money: metersCount * meterPrice,
        limit: Number(data?.metersCount) + Number(user?.limit),
      },
      {
        onSuccess: () => {
          toast.success(t("users.userChargedSuccess"));
          onCloseModal?.();
          reset();
          socket.emit("SendInitialLimit", {
            userId: user?._id,
            state: true,
            limit: Number(data?.metersCount) + Number(user?.limit),
          });
        },
        onError: () => toast.error(t("users.userChargedFailed")),
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[10px] text-textColor"
    >
      <h2 className="my-[10px] text-xl capitalize">{t("users.addCharge")}</h2>
      <Input
        placeholder={t("general.metersCount")}
        disabled={isCharging}
        error={errors?.metersCount?.message}
        {...register("metersCount", {
          required: t("general.metersCountRequired"),
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          pattern: {
            value: NUMBER_INPUT_REGEX,
            message: t("general.numbersOnly"),
          },

          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      <p className="mt-[20px] rounded-md bg-[#6366f1] p-[5px]">
        {t("general.totalPrice")}: {meterPrice * metersCount}
      </p>

      <div className="mt-[20px] flex w-[40%] flex-col gap-[10px] self-end">
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          {t("general.cancel")}
        </Button>
        <Button type="submit" disabled={isCharging}>
          {t("users.addCharge")}
        </Button>
      </div>
    </form>
  );
}

export default AddChargeFrom;
