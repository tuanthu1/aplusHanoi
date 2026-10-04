import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
const TransferPaymentModal = ({
  isOpen,
  paymentInfo,
  onClose,
  onConfirm,
  isSubmitting

}) => {
    const { t } = useTranslation();
  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleCloseClick = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <div className="transfer-modal-overlay" onClick={handleOverlayClick}>
      <div className="transfer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="transfer-close-btn" onClick={handleCloseClick} disabled={isSubmitting}>
          x
        </button>
        <h2 className="transfer-title">{t('transferPayment.title')}</h2>

        <div className="transfer-amount">
          {t('transferPayment.amount')}: <strong>{paymentInfo.depositAmount.toLocaleString('vi-VN')} VND</strong>
        </div>

        <div className="transfer-detail-list">
          <p>
            <span>{t('transferPayment.accountName')}:</span>
            <strong>{paymentInfo.accountName}</strong>
          </p>
          <p>
            <span>{t('transferPayment.bankName')}:</span>
            <strong>{paymentInfo.bankName}</strong>
          </p>
          <p>
            <span>{t('transferPayment.accountNumber')}:</span>
            <strong>{paymentInfo.accountNumber}</strong>
          </p>
          <p>
            <span>{t('transferPayment.transferContent')}:</span>
            <strong>{paymentInfo.transferContent}</strong>
          </p>
        </div>

        <div className="transfer-actions">
          <button className="transfer-secondary-btn" onClick={onClose} disabled={isSubmitting}>
            {t('transferPayment.later')}
          </button>
          <button className="transfer-primary-btn" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? t('transferPayment.processing') : t('transferPayment.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPaymentModal;
