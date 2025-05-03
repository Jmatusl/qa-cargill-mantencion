"use client";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import React, { useState } from "react"; // Importa React y ReactElement

type ChildProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data?: any;
};

type ModalProps = {
  children: React.ReactElement<ChildProps> | React.ReactElement<ChildProps>[];
  trigger: React.ReactNode;
  className?: string;
  size?: string;
  data?: any;
};

export function Modal({ trigger, children, data, ...props }: ModalProps) {
  const [open, setOpen] = useState(false);

  const clonedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, { setOpen, data })
  );

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full  sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl max-h-[90vh] overflow-y-auto p-4">
        {clonedChildren}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;
