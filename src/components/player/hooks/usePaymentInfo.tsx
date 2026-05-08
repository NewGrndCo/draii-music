
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  getPaymentInfo, 
  storePaymentInfo
} from '../../../utils/earningsUtil';

export const usePaymentInfo = () => {
  // Payment info dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'cashapp' | 'paypal'>('cashapp');
  const [paymentValue, setPaymentValue] = useState<string>('');
  
  // Mining dialog state
  const [showMiningDialog, setShowMiningDialog] = useState<boolean>(false);
  
  // Terms of service modal state
  const [showFullTerms, setShowFullTerms] = useState<boolean>(false);
  
  // Check if payment info has been provided
  useEffect(() => {
    const paymentInfo = getPaymentInfo();
    if (paymentInfo) {
      setPaymentType(paymentInfo.type);
      setPaymentValue(paymentInfo.value);
    }
  }, []);
  
  // Save payment information
  const savePaymentInfo = () => {
    // Validate input
    if (!paymentValue.trim()) {
      toast.error("Please enter a valid payment method");
      return;
    }
    
    if (paymentType === 'cashapp' && !paymentValue.startsWith('$')) {
      toast.error("CashApp username must start with $");
      return;
    }
    
    if (paymentType === 'paypal' && !paymentValue.includes('@')) {
      toast.error("Please enter a valid email address for PayPal");
      return;
    }
    
    // Store payment info
    storePaymentInfo(paymentType, paymentValue);
    setShowPaymentDialog(false);
    
    toast.success("Payment information saved!");
  };
  
  // Toggle mining information display
  const toggleMiningInfo = () => {
    setShowMiningDialog(true);
  };
  
  // Open terms of service
  const openTermsOfService = () => {
    setShowFullTerms(true);
  };
  
  return {
    showPaymentDialog,
    setShowPaymentDialog,
    paymentType,
    setPaymentType,
    paymentValue,
    setPaymentValue,
    showMiningDialog,
    setShowMiningDialog,
    showFullTerms,
    setShowFullTerms,
    savePaymentInfo,
    toggleMiningInfo,
    openTermsOfService
  };
};
