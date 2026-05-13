export enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum BloodGroup {
  A_POS = "A_POS",
  A_NEG = "A_NEG",
  B_POS = "B_POS",
  B_NEG = "B_NEG",
  O_POS = "O_POS",
  O_NEG = "O_NEG",
  AB_POS = "AB_POS",
  AB_NEG = "AB_NEG",
}

export enum DonorStatus {
  PENDING = "PENDING",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export enum EmergencyStatus {
  OPEN = "OPEN",
  FULFILLED = "FULFILLED",
  CLOSED = "CLOSED",
}

export const bloodGroupDisplay: Record<BloodGroup, string> = {
  [BloodGroup.A_POS]: "A+",
  [BloodGroup.A_NEG]: "A-",
  [BloodGroup.B_POS]: "B+",
  [BloodGroup.B_NEG]: "B-",
  [BloodGroup.O_POS]: "O+",
  [BloodGroup.O_NEG]: "O-",
  [BloodGroup.AB_POS]: "AB+",
  [BloodGroup.AB_NEG]: "AB-",
};
