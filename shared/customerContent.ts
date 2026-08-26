export function canReleaseCustomerContent(input: { ownerApproved: boolean; purchaseApproved: boolean; listingActive: boolean }) {
  return Boolean(input.ownerApproved && input.purchaseApproved && input.listingActive);
}
