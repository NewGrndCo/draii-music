import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import MusicLibrary from '../MusicLibrary';
import PaymentDialog from './PaymentDialog';
import MiningDialog from './MiningDialog';
import TermsDialog from './TermsDialog';

const DialogsContainer: React.FC = () => {
  const {
    albums, loading, showLibrary, closeLibrary, handleSelectSong,
    showPaymentDialog, setShowPaymentDialog, paymentType, setPaymentType,
    paymentValue, setPaymentValue, savePaymentInfo,
    showMiningDialog, setShowMiningDialog,
    showFullTerms, setShowFullTerms
  } = usePlayer();

  return (
    <>
      <MusicLibrary
        albums={albums}
        onSelectSong={handleSelectSong}
        onClose={closeLibrary}
        isVisible={showLibrary}
        isLoading={loading}
        darkMode={false}
        onToggleDarkMode={() => {}}
      />
      <PaymentDialog
        showPaymentDialog={showPaymentDialog}
        setShowPaymentDialog={setShowPaymentDialog}
        paymentType={paymentType}
        paymentValue={paymentValue}
        setPaymentType={setPaymentType}
        setPaymentValue={setPaymentValue}
        savePaymentInfo={savePaymentInfo}
      />
      <MiningDialog
        showMiningDialog={showMiningDialog}
        setShowMiningDialog={setShowMiningDialog}
      />
      <TermsDialog
        showFullTerms={showFullTerms}
        setShowFullTerms={setShowFullTerms}
      />
    </>
  );
};

export default React.memo(DialogsContainer);
