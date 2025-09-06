"use client"

import type * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog"

function Modal({ children, ...props }: React.ComponentProps<typeof Dialog>) {
  return <Dialog {...props}>{children}</Dialog>
}

function ModalTrigger({ ...props }: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props} />
}

function ModalContent({ ...props }: React.ComponentProps<typeof DialogContent>) {
  return <DialogContent {...props} />
}

function ModalHeader({ ...props }: React.ComponentProps<typeof DialogHeader>) {
  return <DialogHeader {...props} />
}

function ModalFooter({ ...props }: React.ComponentProps<typeof DialogFooter>) {
  return <DialogFooter {...props} />
}

function ModalTitle({ ...props }: React.ComponentProps<typeof DialogTitle>) {
  return <DialogTitle {...props} />
}

function ModalDescription({ ...props }: React.ComponentProps<typeof DialogDescription>) {
  return <DialogDescription {...props} />
}

export { Modal, ModalContent, ModalDescription, ModalFooter, ModalHeader, ModalTitle, ModalTrigger }
