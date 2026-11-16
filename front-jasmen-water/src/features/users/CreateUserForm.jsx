import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { isOnlySpaces } from "../../utils/helpers";
import {
  EMAIL_REGEX,
  MAX_INPUT_LENGTH,
  MIN_INPUT_LENGTH,
  NUMBER_INPUT_REGEX,
} from "../../utils/constants";
import { useUpdateUser } from "./useUpdateUser";
import { useCreateUser } from "./useCreateUser";

import Input from "../../ui/Input";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

function CreateUserForm({ userToEdit, onCloseModal }) {
  const { t } = useTranslation();

  const { isUpdating, updateUser } = useUpdateUser();
  const { isCreating, createUser } = useCreateUser();

  const isEditSession = Boolean(userToEdit);

  const { register, handleSubmit, formState, reset } = useForm({
    defaultValues: isEditSession
      ? {
          userName: userToEdit?.userName,
          email: userToEdit?.email,
          mobile: userToEdit?.mobile,
          roomNumber: userToEdit?.roomNumber,
          limit: userToEdit?.limit,
        }
      : {},
  });

  function onSubmit(data) {
    if (isEditSession) {
      updateUser(
        { id: userToEdit?._id, data },
        {
          onSuccess: () => {
            toast.success(t("users.updatedSuccessfully"));
            onCloseModal?.();
          },
          onError: () => {
            toast.error(t("users.updateFailed"));
          },
        },
      );
    } else {
      createUser(
        { ...data },
        {
          onSuccess: (data) => {
            toast.success(t("users.createSuccess"));
            reset();
            onCloseModal?.();
          },
          onError: () => {
            toast.error(t("users.createFailed"));
          },
        },
      );
    }
  }

  const isWorking = isCreating || isUpdating;

  const { errors } = formState;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-[10px] text-textColor"
    >
      <h2 className="my-[10px] text-xl capitalize">
        {isEditSession ? t("users.editUser") : t("users.createUser")}
      </h2>
      <Input
        placeholder={t("general.name")}
        disabled={isWorking}
        error={errors?.userName?.message}
        {...register("userName", {
          required: t("general.nameRequired"),
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          minLength: {
            value: MIN_INPUT_LENGTH,
            message: t("general.minLength"),
          },
          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      <Input
        placeholder={t("general.email")}
        disabled={isWorking}
        error={errors?.email?.message}
        {...register("email", {
          required: t("general.emailIsRequired"),
          validate: {
            noOnlySpaces: (value) =>
              !isOnlySpaces(value) || t("general.onlySpaces"),
          },
          pattern: {
            value: EMAIL_REGEX,
            message: t("general.emailPattern"),
          },
          minLength: {
            value: MIN_INPUT_LENGTH,
            message: t("general.minLength"),
          },
          maxLength: {
            value: MAX_INPUT_LENGTH,
            message: t("general.maxLength"),
          },
        })}
      />

      {!isEditSession && (
        <Input
          placeholder={t("general.passwordPlaceholder")}
          type="password"
          disabled={isWorking}
          error={errors?.password?.message}
          {...register("password", {
            required: t("general.passwordIsRequired"),
            minLength: {
              value: 8,
              message: t("general.passwordLength"),
            },
          })}
        />
      )}

      <Input
        placeholder={t("users.mobile")}
        disabled={isWorking}
        error={errors?.mobile?.message}
        {...register("mobile", {
          required: t("general.mobileRequired"),
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
        placeholder={t("users.roomNumber")}
        disabled={isWorking}
        error={errors?.roomNumber?.message}
        {...register("roomNumber", {
          required: t("general.roomNumberRequired"),
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

      {isEditSession && (
        <>
          <Input
            placeholder={t("users.limit")}
            disabled={isWorking}
            error={errors?.limit?.message}
            {...register("limit", {
              required: t("general.limitRequired"),
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
        </>
      )}

      <div className="mt-[20px] flex w-[40%] flex-col gap-[10px] self-end">
        <Button
          variation="secondary"
          type="reset"
          onClick={() => onCloseModal?.()}
        >
          {t("general.cancel")}
        </Button>
        <Button type="submit" disabled={isWorking}>
          {isEditSession ? t("users.editUser") : t("users.createUser")}
        </Button>
      </div>
    </form>
  );
}

export default CreateUserForm;
