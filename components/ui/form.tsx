"use client"

import * as React from "react"
import { type z } from "zod"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

// ---------------------------------------------------------------------------
// useForm hook
// ---------------------------------------------------------------------------

type FieldRegisterReturn = {
  name: string
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export function useForm<TData extends Record<string, unknown>>(
  schema: z.ZodType<TData>,
  defaultValues: TData
) {
  const [values, setValues] = React.useState<TData>(defaultValues)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (onValid: (...args: any[]) => void | Promise<void>) =>
      (e: React.FormEvent) => {
        e.preventDefault()
        const result = schema.safeParse(values)
        if (!result.success) {
          const fieldErrors: Record<string, string> = {}
          for (const issue of result.error.issues) {
            const path = issue.path[0] as string
            if (!fieldErrors[path]) fieldErrors[path] = issue.message
          }
          setErrors(fieldErrors)
          return
        }
        setErrors({})
        onValid(result.data as Record<string, unknown>)
      },
    [schema, values]
  )

  const setValue = React.useCallback(
    <K extends keyof TData>(name: K, value: TData[K]) => {
      setValues((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name as string]
        return next
      })
    },
    []
  )

  const register = React.useCallback(
    <K extends keyof TData>(name: K): FieldRegisterReturn => ({
      name: name as string,
      value: (values[name] as string | number) ?? "",
      onChange: (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
      ) => {
        let val: unknown = e.target.value
        if (
          e.target instanceof HTMLInputElement &&
          e.target.type === "number"
        ) {
          val = e.target.value === "" ? 0 : Number(e.target.value)
        }
        setValues((prev) => ({ ...prev, [name]: val }))
        setErrors((prev) => {
          const next = { ...prev }
          delete next[name as string]
          return next
        })
      },
    }),
    [values]
  )

  const getError = React.useCallback(
    (name: string): string | undefined => errors[name],
    [errors]
  )

  return { values, errors, handleSubmit, setValue, register, getError }
}

// ---------------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------------

function Form({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      data-slot="form"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  )
}

interface FormFieldContextValue {
  name: string
  error?: string
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

function useFormField() {
  const ctx = React.useContext(FormFieldContext)
  if (!ctx) {
    throw new Error("useFormField harus digunakan di dalam <FormField>")
  }
  return ctx
}

function FormField({
  name,
  error,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  name: string
  error?: string
}) {
  const ctxValue = React.useMemo<FormFieldContextValue>(
    () => ({ name, error }),
    [name, error]
  )

  return (
    <FormFieldContext.Provider value={ctxValue}>
      <div
        data-slot="form-field"
        className={cn("flex flex-col gap-1.5", className)}
        {...props}
      >
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="form-item"
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  const { error } = useFormField()
  return (
    <Label
      data-slot="form-label"
      className={cn(error && "text-destructive", className)}
      {...props}
    />
  )
}

function FormControl({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const { error } = useFormField()
  if (!error) return null
  return (
    <p
      data-slot="form-message"
      className={cn("text-xs text-destructive", className)}
      {...props}
    >
      {error}
    </p>
  )
}

export {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  useFormField,
}
