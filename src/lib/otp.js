import crypto from "crypto";

export const generateOTP = (length = 6) => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

export const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

export const verifyOTP = (plainOtp, hashedOtp) => {
  const hashedInput = hashOTP(plainOtp);
  return hashedInput === hashedOtp;
};
