
import React, { useEffect, useRef } from 'react';
import { Bitcoin, Cpu, CreditCard, Coins } from 'lucide-react';

interface MatrixBackgroundProps {
  dominantColor?: string;
}

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ dominantColor = 'from-purple-500 via-pink-500 to-rose-500' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Define symbols for the matrix
    const cryptoSymbols = ['Ƀ', '₿', 'Ξ', '◎', 'Ł', '₳', '₮', 'Ð', 'Ӿ', 'Đ', '₴', '₽', '₲', '฿', '$'];
    
    // Parse the dominant color for our matrix
    let matrixColor = '#33ff33'; // Default matrix green
    
    if (dominantColor.includes('purple')) {
      matrixColor = '#c678dd';
    } else if (dominantColor.includes('blue')) {
      matrixColor = '#61afef';
    } else if (dominantColor.includes('pink') || dominantColor.includes('rose')) {
      matrixColor = '#ff6e9c';
    } else if (dominantColor.includes('yellow') || dominantColor.includes('amber')) {
      matrixColor = '#e5c07b';
    } else if (dominantColor.includes('green')) {
      matrixColor = '#98c379';
    } else if (dominantColor.includes('red')) {
      matrixColor = '#e06c75';
    }
    
    // Create matrix drops
    const columns = Math.floor(canvas.width / 20);
    const drops: number[] = [];
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    // Drawing function
    const draw = () => {
      // Add semi-transparent black rectangle on top of previous frame
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set the text color and font
      ctx.fillStyle = matrixColor;
      ctx.font = '15px monospace';
      
      // Draw the symbols
      for (let i = 0; i < drops.length; i++) {
        // Choose a random crypto symbol
        const symbol = cryptoSymbols[Math.floor(Math.random() * cryptoSymbols.length)];
        
        // Draw the symbol
        const x = i * 20;
        const y = drops[i] * 20;
        
        // Only draw if within canvas
        if (y > 0 && y < canvas.height) {
          ctx.globalAlpha = Math.random() * 0.8 + 0.2; // Varying opacity
          ctx.fillText(symbol, x, y);
        }
        
        // Move drop down
        drops[i] += 0.05;
        
        // Reset drop when it reaches bottom
        if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -5;
        }
      }
    };
    
    // Animation loop
    const interval = setInterval(draw, 60);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [dominantColor]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
      style={{ position: "fixed" }}
    />
  );
};

export default MatrixBackground;
