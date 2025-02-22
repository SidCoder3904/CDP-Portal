import { CheckCircle, XCircle } from "lucide-react";

interface VerificationStatusProps {
  isVerified: boolean;
}

export function VerificationStatus({ isVerified }: VerificationStatusProps) {
  return (
    <span
      className={`flex items-center ${
        isVerified ? "text-green-500" : "text-red-500"
      }`}
    >
      {isVerified ? (
        <>
          <CheckCircle className="w-4 h-4 mr-1" />
          Verified
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 mr-1" />
          Not Verified
        </>
      )}
    </span>
  );
}
