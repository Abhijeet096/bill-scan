'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface UseVoiceBillingProps {
  products: any[];
  onCheckoutTrigger: () => void;
}

export const useVoiceBilling = ({ products, onCheckoutTrigger }: UseVoiceBillingProps) => {
  const { addToCart, adjustQuantity, removeFromCart } = useCart();
  const { apiFetch } = useAuth();
  const { notify } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  // The recognizer is created once. It calls through this ref so it always runs
  // the latest handler without being rebuilt on every render.
  const handleResult = useRef<(text: string) => Promise<void>>(async () => {});

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = (event: any) => {
      console.error('Speech recognition error: ', event.error);
      setIsListening(false);
    };
    rec.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      await handleResult.current(text);
    };

    setRecognition(rec);
  }, []);

  const startListening = (lang: string = 'en-US') => {
    if (!recognition) {
      notify('Voice input is not supported in this browser.', 'error');
      return;
    }
    
    // Set appropriate recognition language (English, Hindi, Marathi)
    recognition.lang = lang;
    try {
      recognition.start();
    } catch (e) {
      console.warn('Recognition already started');
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const processVoiceCommand = async (text: string) => {
    try {
      const response = await apiFetch('/api/voice-billing/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });

      if (!response.ok) {
        throw new Error('Voice command parsing failed on server.');
      }

      const command = await response.json();
      console.log('[Voice Command Result] ', command);

      if (command.action === 'CHECKOUT') {
        onCheckoutTrigger();
        return;
      }

      if (command.action === 'UNKNOWN' || !command.productQuery) {
        notify(`Sorry, I didn't understand "${text}".`, 'error');
        return;
      }

      // Find product in catalog matching query
      const query = command.productQuery.toLowerCase().trim();
      const matchedProduct = products.find(p => 
        p.sku.toLowerCase() === query || 
        p.name.toLowerCase().includes(query) || 
        query.includes(p.name.toLowerCase())
      );

      if (!matchedProduct) {
        notify(`"${command.productQuery}" isn't in this store's catalog.`, 'error');
        return;
      }

      if (command.action === 'ADD') {
        // Adjust quantity in cart or add it
        for (let i = 0; i < command.quantity; i++) {
          addToCart(matchedProduct);
        }
      } else if (command.action === 'REMOVE') {
        removeFromCart(matchedProduct.id);
      }
    } catch (error) {
      console.error('Failed to resolve voice billing command: ', error);
    }
  };

  handleResult.current = processVoiceCommand;

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport: !!recognition,
  };
};
