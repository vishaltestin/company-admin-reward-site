import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useLoginMutation } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { AxiosError } from "axios"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Login() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard")
      },
      onError: (error: unknown) => {
        let message = "Login failed. Please try again."

        if (error instanceof AxiosError && error.response?.data?.message) {
          message = error.response.data.message
        }

        setError("root", { message })
      },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 pt-6 pb-8 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            Company Admin Portal
          </CardTitle>
          <CardDescription className="text-base">
            Enter your email and password to access your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pt-0 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                placeholder="admin@company.com"
                autoComplete="email"
                className="h-11 text-base"
                {...register("email")}
                disabled={loginMutation.isPending || isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm font-medium text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold">
                  Password
                </Label>
              </div>
              <Input
                id="password"
                autoComplete="current-password"
                type="password"
                placeholder="••••••••"
                className="h-11 text-base"
                {...register("password")}
                disabled={loginMutation.isPending || isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm font-medium text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            {errors.root && (
              <div className="rounded-md bg-red-50 p-3 text-center text-sm font-medium text-red-500">
                {errors.root.message}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full text-base font-semibold"
              disabled={loginMutation.isPending || isSubmitting}
            >
              {loginMutation.isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
