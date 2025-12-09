import { AlertCircle, Check, X } from "lucide-react";
import type React from "react";

type Verification = {
  payment: boolean;
  phone: boolean;
  governmentId: boolean;
  address: "verified" | "pending" | "unverified";
};

type VerificationListProps = {
  verification: Verification;
  showTitle?: boolean;
  compact?: boolean;
  className?: string;
};

type VerificationItemProps = {
  label: string;
  isVerified: boolean;
  isPending?: boolean;
  useWarningIcon?: boolean;
};

const VerificationItem: React.FC<VerificationItemProps> = ({
  label,
  isVerified,
  isPending = false,
  useWarningIcon = false,
}) => {
  const getIconColors = () => {
    if (isVerified) {
      return "bg-green-100 text-green-600";
    }
    if (isPending || useWarningIcon) {
      return "bg-yellow-100 text-yellow-600";
    }
    return "bg-gray-100 text-gray-400";
  };

  const getTextColors = () => {
    if (isVerified) {
      return "text-gray-800";
    }
    if (isPending || useWarningIcon) {
      return "text-gray-500";
    }
    return "text-gray-400";
  };

  const renderIcon = () => {
    if (isVerified) {
      return <Check size={12} />;
    }
    if (useWarningIcon || isPending) {
      return <AlertCircle size={12} />;
    }
    return <X size={12} />;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`rounded-full p-1 ${getIconColors()}`}>
          {renderIcon()}
        </div>
        <span className={`font-medium text-sm ${getTextColors()}`}>
          {label}
          {isPending && " (Pending)"}
        </span>
      </div>
    </div>
  );
};

export const VerificationList: React.FC<VerificationListProps> = ({
  verification,
  showTitle = true,
  compact = false,
  className = "",
}) => (
  <div className={className}>
    {showTitle && (
      <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-400 text-gray-900 text-xs uppercase tracking-wider">
        Verifications
      </h3>
    )}
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <VerificationItem
        isVerified={verification.payment}
        label="Payment Verified"
      />
      <VerificationItem
        isVerified={verification.phone}
        label="Phone Verified"
      />
      <VerificationItem
        isVerified={verification.governmentId}
        label="Government ID"
        useWarningIcon={!verification.governmentId}
      />
      <VerificationItem
        isPending={verification.address === "pending"}
        isVerified={verification.address === "verified"}
        label="Address"
        useWarningIcon={verification.address !== "verified"}
      />
    </div>
  </div>
);

export default VerificationList;
