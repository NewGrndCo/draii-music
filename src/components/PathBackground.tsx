
import React, { useEffect, useRef } from 'react';

interface PathBackgroundProps {
  color?: string;
  speed?: number;
  density?: number;
}

const PathBackground: React.FC<PathBackgroundProps> = ({ 
  color = '#9b87f5', 
  speed = 0.5, 
  density = 30 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setDimensions();
    window.addEventListener('resize', setDimensions);
    
    // Create path points
    class Point {
      x: number;
      y: number;
      ax = 0;
      ay = 0;
      vx = 0;
      vy = 0;
      
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
      }
    }
    
    class Path {
      points: Point[] = [];
      count = 0;
      
      constructor(count: number) {
        this.count = count;
        this.generate();
      }
      
      generate() {
        const margin = 50;
        const canvasWidth = canvas.width - margin * 2;
        const canvasHeight = canvas.height - margin * 2;
        
        // Clear previous points
        this.points = [];
        
        // Generate points
        for (let i = 0; i < this.count; i++) {
          const x = (canvasWidth * i / (this.count - 1)) + margin;
          const y = margin + Math.random() * canvasHeight;
          this.points.push(new Point(x, y));
        }
      }
      
      update() {
        let i = this.points.length;
        
        while (i--) {
          const point = this.points[i];
          
          // Apply forces
          point.vx += point.ax;
          point.vy += point.ay;
          
          // Apply velocity
          point.x += point.vx;
          point.y += point.vy;
          
          // Apply friction
          point.vx *= 0.98;
          point.vy *= 0.98;
          
          // Apply boundaries, except for first and last point
          if (i > 0 && i < this.points.length - 1) {
            const margin = 50;
            if (point.y < margin) {
              point.y = margin;
              point.vy = 0;
            } else if (point.y > canvas.height - margin) {
              point.y = canvas.height - margin;
              point.vy = 0;
            }
          }
          
          // Random movement
          point.ay = (Math.random() - 0.5) * speed;
        }
      }
      
      draw() {
        if (!ctx) return;
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length - 2; i++) {
          const xc = (this.points[i].x + this.points[i + 1].x) / 2;
          const yc = (this.points[i].y + this.points[i + 1].y) / 2;
          
          ctx.quadraticCurveTo(this.points[i].x, this.points[i].y, xc, yc);
        }
        
        const i = this.points.length - 2;
        ctx.quadraticCurveTo(
          this.points[i].x,
          this.points[i].y,
          this.points[i + 1].x,
          this.points[i + 1].y
        );
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    
    // Create multiple paths
    const numPaths = density;
    const paths: Path[] = [];
    
    for (let i = 0; i < numPaths; i++) {
      const numPoints = Math.floor(Math.random() * 5) + 5; // 5-10 points per path
      paths.push(new Path(numPoints));
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw paths
      paths.forEach(path => {
        path.update();
        path.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setDimensions);
    };
  }, [color, speed, density]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-40"
      style={{ position: "fixed", background: 'black' }}
    />
  );
};

export default PathBackground;
