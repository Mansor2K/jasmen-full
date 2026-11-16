import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useAddTax } from "./useAddTax";
import { isOnlySpaces } from "../../utils/helpers";
import {
  MAX_INPUT_LENGTH,
  NUMBER_INPUT_REGEX,
  TEXT_INPUT_REGEX,
} from "../../utils/constants";
import { useParams } from "react-router-dom";
import { useEditTax } from "./useEditTax";

import Button from "../../ui/Button";
import toast from "react-hot-toast";
import Input from "../../ui/Input";

function AddTaxForm({ onCloseModal, taxToEdit }) {
  const { id } = useParams();

  const isEditSession = Boolean(taxToEdit);

  const { isLoading, addTax } = useAddTax();
  const { isUpdating, updateUserTax } = useEditTax();
  const isWorking = isLoading || isUpdating;

  const [t] = useTranslation();
  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: isEditSession
      ? {
          value: taxToEdit?.value,
          reason: taxToEdit?.reason,
        }
      : {},
  });
  const { errors } = formState;

  function onSubmit(data) {
    if (isEditSession) {
      updateUserTax(
        {
          id,
          data,
          objectId: taxToEdit?._id,
        },
        {
          onSuccess: () => {
            toast.success(t("users.taxEditedSuccess"));
            onCloseModal?.();
            reset();
          },
          onError: () => toast.error(t("users.taxEditError")),
        },
      );
    } else {
      addTax(
        {
          id,
          data,
        },
        {
          onSuccess: () => {
            toast.success(t("users.taxSuccess"));
            onCloseModal?.();
            reset();
          },
          onError: () => toast.error(t("users.taxError")),
        },
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[10px] text-textColor"
    >
      <h2 className="my-[10px] text-xl capitalize">
        {isEditSession ? t("users.editTax") : t("users.addTax")}
      </h2>

      <Input
        placeholder={t("general.taxValue")}
        disabled={isWorking}
        error={errors?.value?.message}
        {...register("value", {
          required: t("general.taxValueRequired"),
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

      <Input
        placeholder={t("general.taxReason")}
        disabled={isWorking}
        error={errors?.reason?.message}
        {...register("reason", {
          required: t("general.taxReasonRequired"),
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          pattern: {
            value: TEXT_INPUT_REGEX,
            message: t("general.textOnly"),
          },

          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      <div className="mt-[20px] flex w-[40%] flex-col gap-[10px] self-end">
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          {t("general.cancel")}
        </Button>
        <Button type="submit" disabled={isWorking}>
          {isEditSession ? t("users.editTax") : t("users.addTax")}
        </Button>
      </div>
    </form>
  );
}

export default AddTaxForm;
