import AppContext from 'benefit/handler/context/AppContext';
import { useApplicationActions } from 'benefit/handler/hooks/useApplicationActions';
import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
import { HandledAplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import useToggle from 'shared/hooks/useToggle';

type ExtendedComponentProps = {
  t: TFunction;
  onDone: () => void;
  onDoneConfirmation: () => void;
  onSaveAndClose: () => void;
  onBackToHandling: () => void;
  onCommentsChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toggleMessagesDrawerVisiblity: () => void;
  handleCancel: (application: HandledAplication) => void;
  openDialog: () => void;
  closeDialog: () => void;
  closeDoneDialog: () => void;
  translationsBase: string;
  isDisabledDoneButton: boolean;
  isMessagesDrawerVisible: boolean;
  isConfirmationModalOpen: boolean;
  isDoneConfirmationModalOpen: boolean;
  cancelComments: string;
  handledApplication: HandledAplication;
};

const useHandlingApplicationActions = (
  application: Application
): ExtendedComponentProps => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { onSaveAndClose, onDone, onCancel } =
    useHandlerReviewActions(application);
  const { updateStatus } = useApplicationActions(application);
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);
  const router = useRouter();
  const { openDrawer } = router.query;
  const [isMessagesDrawerVisible, toggleMessagesDrawerVisiblity] = useToggle(
    Boolean(openDrawer)
  );

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState<boolean>(false);

  const [isDoneConfirmationModalOpen, setIsDoneConfirmationModalOpen] =
    useState<boolean>(false);

  const [cancelComments, setCancelComments] = useState<string>('');

  const isDisabledDoneButton = React.useMemo(
    (): boolean =>
      !handledApplication ||
      !(
        handledApplication.status === APPLICATION_STATUSES.ACCEPTED ||
        (handledApplication.status === APPLICATION_STATUSES.REJECTED &&
          handledApplication.logEntryComment)
      ),
    [handledApplication]
  );

  const openDialog = (): void => setIsConfirmationModalOpen(true);

  const onDoneConfirmation = (): void => setIsDoneConfirmationModalOpen(true);

  const closeDialog = (): void => {
    setIsConfirmationModalOpen(false);
    setHandledApplication(null);
  };

  const closeDoneDialog = (): void => {
    setIsDoneConfirmationModalOpen(false);
  };

  useEffect(() => {
    if (application.status === APPLICATION_STATUSES.CANCELLED) {
      setIsConfirmationModalOpen(false);
    }
  }, [application]);

  const handleCancel = (cancelledApplication: HandledAplication): void => {
    // workaround for broken hds dialog
    setHandledApplication(cancelledApplication);
    onCancel(cancelledApplication);
  };

  const onCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void => setCancelComments(event.target.value);

  const onBackToHandling = (): void =>
    updateStatus(APPLICATION_STATUSES.HANDLING);

  return {
    t,
    onDone,
    onDoneConfirmation,
    onSaveAndClose,
    onCommentsChange,
    onBackToHandling,
    toggleMessagesDrawerVisiblity,
    handleCancel,
    openDialog,
    closeDialog,
    closeDoneDialog,
    isMessagesDrawerVisible,
    translationsBase,
    isDisabledDoneButton,
    isConfirmationModalOpen,
    isDoneConfirmationModalOpen,
    cancelComments,
    handledApplication,
  };
};

export { useHandlingApplicationActions };
