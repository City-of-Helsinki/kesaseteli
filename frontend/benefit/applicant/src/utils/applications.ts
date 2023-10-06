import { APPLICATION_STATUSES } from 'benefit-shared/constants';

export const isApplicationReadOnly = (status: APPLICATION_STATUSES): boolean =>
  [APPLICATION_STATUSES.DRAFT, APPLICATION_STATUSES.INFO_REQUIRED].includes(
    status
  );
