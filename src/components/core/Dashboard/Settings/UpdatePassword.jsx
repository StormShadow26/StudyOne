import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import { changePassword } from "../../../../services/operations/SettingsAPI"
import IconBtn from "../../../common/IconBtn"

export default function UpdatePassword() {
  const { token } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmedNewPassword, setShowConfirmedNewPassword] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  const submitPasswordForm = async (data) => {
    if (data.newPassword !== data.confirmNewPassword) {
      console.log("New passwords don't match")
      return
    }

    console.log("password Data - ", data)
    try {
      await changePassword(token, data)
    } catch (error) {
      console.log("ERROR MESSAGE - ", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(submitPasswordForm)}>
      <div className="my-10 flex flex-col gap-y-6 rounded-md border-[1px] border-richblack-700 bg-richblack-800 p-8 px-12">
        <h2 className="text-lg font-semibold text-richblack-5">Password</h2>
        <div className="flex flex-col gap-5 lg:flex-row">
          {/* Old Password Field */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="oldPassword" className="lable-style">
              Current Password
            </label>
            <input
              type={showOldPassword ? "text" : "password"}
              name="oldPassword"
              id="oldPassword"
              placeholder="Enter Current Password"
              className="form-style"
              {...register("oldPassword", { required: true })}
            />
            <span
              onClick={() => setShowOldPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showOldPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {errors.oldPassword && (
              <span className="-mt-1 text-[12px] text-yellow-100">
                Please enter your Current Password.
              </span>
            )}
          </div>

          {/* New Password Field */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="newPassword" className="lable-style">
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              id="newPassword"
              placeholder="Enter New Password"
              className="form-style"
              {...register("newPassword", { required: true })}
            />
            <span
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showNewPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {errors.newPassword && (
              <span className="-mt-1 text-[12px] text-yellow-100">
                Please enter your New Password.
              </span>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div className="relative flex flex-col gap-2 lg:w-[48%]">
            <label htmlFor="confirmNewPassword" className="lable-style">
              Confirm New Password
            </label>
            <input
              type={showConfirmedNewPassword ? "text" : "password"}
              name="confirmNewPassword"
              id="confirmNewPassword"
              placeholder="Confirm New Password"
              className="form-style"
              {...register("confirmNewPassword", { required: true })}
            />
            <span
              onClick={() => setShowConfirmedNewPassword((prev) => !prev)}
              className="absolute right-3 top-[38px] z-[10] cursor-pointer"
            >
              {showConfirmedNewPassword ? (
                <AiOutlineEyeInvisible fontSize={24} fill="#AFB2BF" />
              ) : (
                <AiOutlineEye fontSize={24} fill="#AFB2BF" />
              )}
            </span>
            {errors.confirmNewPassword && (
              <span className="-mt-1 text-[12px] text-yellow-100">
                Please confirm your New Password.
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            navigate("/dashboard/my-profile")
            reset() // Reset the form values
          }}
          className="cursor-pointer rounded-md bg-richblack-700 py-2 px-5 font-semibold text-richblack-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-yellow-100 py-2 px-5 font-semibold text-richblack-800"
        >
          Save
        </button>
      </div>
    </form>
  )
}
