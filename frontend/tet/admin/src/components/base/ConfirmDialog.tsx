import React from 'react';
import Modal from 'shared/components/modal/Modal';
import useConfirm from 'tet/admin/hooks/context/useConfirm';
import { useTranslation } from 'benefit/applicant/i18n';

const ConfirmDialog = () => {
  const { onConfirm, onCancel, confirmState } = useConfirm();
  const { t } = useTranslation();

  const component = confirmState.show ? (
    <Modal
      id="confirmation_dialog"
      isOpen={confirmState.show}
      title={confirmState.header}
      submitButtonLabel={confirmState.submitButtonLabel}
      cancelButtonLabel={t('common:dialog.cancel')}
      handleToggle={onCancel}
      handleSubmit={onConfirm}
      variant="primary"
    >
      {confirmState.content?.length ? confirmState.content : null}
    </Modal>
  ) : null;

  return component;
};
export default ConfirmDialog;
