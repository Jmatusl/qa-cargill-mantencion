import { useState } from "react";

const useEditableToggles = (editButtons: boolean) => {
  const [isEditableDescription, setIsEditableDescription] = useState(false);
  const [isEditableStatus, setIsEditableStatus] = useState(false);
  const [isEditableResponsible, setIsEditableResponsible] = useState(false);
  const [isEditableActions, setIsEditableActions] = useState(false);

  const toggleEditableDescription = () => {
    if (editButtons) setIsEditableDescription(!isEditableDescription);
  };

  const toggleEditableStatus = () => {
    if (editButtons) setIsEditableStatus(!isEditableStatus);
  };

  const toggleEditableResponsible = () => {
    if (editButtons) setIsEditableResponsible(!isEditableResponsible);
  };

  const toggleEditableActions = () => {
    if (editButtons) setIsEditableActions(!isEditableActions);
  };

  return {
    isEditableDescription,
    isEditableStatus,
    isEditableResponsible,
    isEditableActions,
    toggleEditableDescription,
    toggleEditableStatus,
    toggleEditableResponsible,
    toggleEditableActions,
  };
};

export default useEditableToggles;
