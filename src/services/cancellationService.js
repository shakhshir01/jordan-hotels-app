// Advanced Cancellation Service
export const CANCELLATION_POLICIES = {
  free: {
    name: 'Free Cancellation',
    icon: '✅',
    description: 'Cancel free until 48 hours before check-in',
    refundPercentage: 100,
    deadline: '48 hours',
  },
  flexible: {
    name: 'Flexible',
    icon: '⚡',
    description: 'Cancel free until 7 days before check-in',
    refundPercentage: 100,
    deadline: '7 days',
  },
  nonRefundable: {
    name: 'Non-Refundable',
    icon: '🔒',
    description: 'No refund if cancelled',
    refundPercentage: 0,
    deadline: 'None',
    discount: '15% discount',
  },
};

export const processInstantRefund = (bookingAmount, policyType) => {
  const policy = CANCELLATION_POLICIES[policyType];
  const refundAmount = (bookingAmount * policy.refundPercentage) / 100;

  return {
    originalAmount: bookingAmount,
    refundAmount,
    processingTime: '24-48 hours',
    method: 'Original payment method',
    status: 'Instant processing',
    note: 'No hidden fees, no questions asked',
  };
};

export const getCancellationDeadline = (checkInDate, policyType) => {
  const policy = CANCELLATION_POLICIES[policyType];
  const checkIn = new Date(checkInDate);
  const deadline = new Date(checkIn);

  if (policy.deadline.includes('48 hours')) {
    deadline.setHours(deadline.getHours() - 48);
  } else if (policy.deadline.includes('7 days')) {
    deadline.setDate(deadline.getDate() - 7);
  }

  return {
    deadline,
    hoursLeft: (deadline - new Date()) / (1000 * 60 * 60),
    isRefundable: (deadline - new Date()) > 0,
  };
};
