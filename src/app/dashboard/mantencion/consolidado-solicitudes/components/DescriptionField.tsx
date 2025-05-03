import React, { useRef, useEffect } from "react";

interface DescriptionFieldProps {
  register: any;
  errors: any;
  description?: string;
}

const DescriptionField: React.FC<DescriptionFieldProps> = ({
  register,
  errors,
  description,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reinicia la altura
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Ajusta a la altura del contenido
    }
  };

  useEffect(() => {
    adjustHeight(); // Ajustar la altura inicialmente
  }, [description]);

  return (
    <div className="space-y-2 mt-2">
      <label htmlFor="description" className="text-sm font-semibold block">
        Descripción del Síntoma
      </label>
      <textarea
        id="description"
        {...register("description")}
        ref={textareaRef}
        defaultValue={description || "No hay descripción disponible."} // Valor inicial
        className="w-full p-2 rounded text-slate-900 bg-slate-200 opacity-50 cursor-not-allowed resize-none overflow-hidden"
        placeholder="Descripción"
        readOnly
        onInput={adjustHeight} // Ajusta la altura dinámicamente al escribir
      />
      {errors.description && (
        <span className="text-red-500 text-xs block">
          {errors.description.message}
        </span>
      )}
    </div>
  );
};

export default DescriptionField;
