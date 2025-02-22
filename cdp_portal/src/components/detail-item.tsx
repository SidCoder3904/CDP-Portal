import { VerificationStatus } from "./verification-status";

interface DetailItemProps {
  label: string;
  value: string;
  isVerified: boolean;
}

export function DetailItem({ label, value, isVerified }: DetailItemProps) {
  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-500">{label}</div>
      <div className="mt-1 text-sm text-gray-900">{value}</div>
      <div className="mt-1">
        <VerificationStatus isVerified={isVerified} />
      </div>
    </div>
  );
}
