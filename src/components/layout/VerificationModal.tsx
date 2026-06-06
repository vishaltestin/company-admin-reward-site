import { useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useLocation, useNavigate } from "react-router-dom"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export function VerificationModal() {
  const [open, setOpen] = useState(true)

  const user = useAuthStore((state) => state.user)
  const location = useLocation()
  const navigate = useNavigate()

  if (!user || !user.company) return null

  const status = user.company.verification_status
  const isProfilePage = location.pathname.includes("/profile")

  if (status === "verified" || isProfilePage) return null

  let title = "Account Verification Required"
  let description =
    "Please complete your business KYC details (GST/PAN) to verify your account and unlock all features."
  let buttonText = "Complete Profile"

  if (status === "submitted") {
    title = "Account Under Review"
    description =
      "Your business details have been submitted and are currently under review by our team. Some dashboard features may be restricted until approved."
    buttonText = "View Profile"
  } else if (status === "rejected") {
    title = "Verification Rejected"
    description =
      "There was an issue with your uploaded business documents. Please review and update your KYC details."
    buttonText = "Update Profile"
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>

          <AlertDialogAction
            onClick={() => {
              setOpen(false)
              navigate("/profile")
            }}
          >
            {buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
