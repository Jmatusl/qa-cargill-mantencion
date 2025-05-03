export type Change = {
    field: string;
    oldValue: any;
    newValue: any;
  };
  
  export type ChangeRecord = {
    timestamp: string;
    userId: number;
    username: string; 
    changes: Change[];
  };

  export type EquipmentUpdatableFields =
  | "area"
  | "subarea"
  | "name"
  | "brand"
  | "model"
  | "series"
  | "extra"
  | "status"
  | "active"
  | "shipId"
  | "responsibleId";

  