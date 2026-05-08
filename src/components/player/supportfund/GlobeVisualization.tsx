
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface GlobeVisualizationProps {
  networkUserCount: number;
}

const GlobeVisualization: React.FC<GlobeVisualizationProps> = ({ networkUserCount }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const earthMapRef = useRef<THREE.Texture | null>(null);
  const isInitialized = useRef(false);

  // Generate user distribution based on network user count
  const generateUserDistribution = (totalUsers: number) => {
    // Distribution roughly matching the map image
    const regions = [
      { name: 'North America', weight: 0.45, color: new THREE.Color(0x6366f1), lat: 40, lng: -100 },
      { name: 'South America', weight: 0.10, color: new THREE.Color(0xec4899), lat: -20, lng: -60 },
      { name: 'Europe', weight: 0.20, color: new THREE.Color(0xec4899), lat: 50, lng: 10 },
      { name: 'Africa', weight: 0.05, color: new THREE.Color(0xec4899), lat: 0, lng: 20 },
      { name: 'Asia', weight: 0.15, color: new THREE.Color(0xec4899), lat: 30, lng: 90 },
      { name: 'Australia', weight: 0.05, color: new THREE.Color(0xec4899), lat: -25, lng: 135 }
    ];

    return regions.map(region => {
      const userCount = Math.floor(totalUsers * region.weight);
      return { ...region, users: userCount };
    });
  };

  // Convert lat/long to 3D coordinates on a sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    if (!containerRef.current || isInitialized.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Set up camera
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.z = 4;
    cameraRef.current = camera;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    
    // Add renderer to DOM
    containerRef.current.appendChild(renderer.domElement);

    // Load earth texture for globe
    const textureLoader = new THREE.TextureLoader();
    earthMapRef.current = textureLoader.load('/placeholder.svg', () => {
      // Create globe geometry
      const radius = 1.5;
      const geometry = new THREE.SphereGeometry(radius, 64, 64);
      
      // Create material with earth texture and sci-fi glow
      const material = new THREE.MeshPhongMaterial({
        map: earthMapRef.current,
        emissive: new THREE.Color(0x3b82f6),
        emissiveIntensity: 0.2,
        transparent: true,
        opacity: 0.9,
        shininess: 50
      });
      
      // Create wireframe material
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });
      
      // Create the globe mesh
      const globe = new THREE.Mesh(geometry, material);
      scene.add(globe);
      
      // Add wireframe overlay
      const wireframeGlobe = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.02, 32, 32),
        wireframeMaterial
      );
      scene.add(wireframeGlobe);
      
      globeRef.current = globe;
    });

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Add point light
    const pointLight = new THREE.PointLight(0x6366f1, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Add blue rim light
    const rimLight = new THREE.PointLight(0x00aaff, 1);
    rimLight.position.set(-10, -10, -10);
    scene.add(rimLight);

    // Mark as initialized
    isInitialized.current = true;

    // Animation loop
    const animate = () => {
      if (!globeRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      requestAnimationFrame(animate);
      
      // Rotate globe with sci-fi slow rotation
      globeRef.current.rotation.y += 0.002;
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    // Initial size and start animation
    handleResize();
    animate();

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Update user markers when network user count changes
  useEffect(() => {
    if (!sceneRef.current || !globeRef.current) return;
    
    // Clear existing markers (all children except the globe itself)
    const markerGroup = sceneRef.current.children.find(child => child.name === 'markers');
    if (markerGroup) {
      sceneRef.current.remove(markerGroup);
    }
    
    // Create new marker group
    const newMarkerGroup = new THREE.Group();
    newMarkerGroup.name = 'markers';
    sceneRef.current.add(newMarkerGroup);
    
    // Generate user distribution
    const userDistribution = generateUserDistribution(networkUserCount);
    
    // Create markers for each region
    userDistribution.forEach(region => {
      // Add a dot for the region
      const point = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 16, 16),
        new THREE.MeshBasicMaterial({ 
          color: region.color,
          transparent: true,
          opacity: 0.8
        })
      );
      
      // Position based on lat/long
      const position = latLngToVector3(region.lat, region.lng, 1.5);
      point.position.set(position.x, position.y, position.z);
      
      // Add to marker group
      newMarkerGroup.add(point);
      
      // For North America, add a glow effect and larger point
      if (region.name === 'North America') {
        // Create sci-fi glow effect
        const glowMaterial = new THREE.SpriteMaterial({
          map: new THREE.TextureLoader().load('/placeholder.svg'),
          color: 0x6366f1,
          transparent: true,
          blending: THREE.AdditiveBlending
        });
        
        const glow = new THREE.Sprite(glowMaterial);
        glow.scale.set(0.2, 0.2, 1);
        glow.position.set(position.x, position.y, position.z);
        newMarkerGroup.add(glow);
        
        // Make the point larger
        point.scale.set(1.5, 1.5, 1.5);
        
        // Add a pulsating animation
        const pulse = () => {
          const scale = 1 + 0.2 * Math.sin(Date.now() * 0.003);
          point.scale.set(1.5 * scale, 1.5 * scale, 1.5 * scale);
          requestAnimationFrame(pulse);
        };
        pulse();
      }
      
      // Add data connection lines between regions
      if (region.name !== 'North America') {
        const naRegion = userDistribution.find(r => r.name === 'North America');
        if (naRegion) {
          const startPos = latLngToVector3(naRegion.lat, naRegion.lng, 1.5);
          const endPos = position;
          
          // Create curved path
          const curvePoints = [];
          const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
          const distance = startPos.distanceTo(endPos);
          midPoint.normalize().multiplyScalar(1.5 + distance * 0.2);
          
          curvePoints.push(startPos);
          curvePoints.push(midPoint);
          curvePoints.push(endPos);
          
          const curve = new THREE.QuadraticBezierCurve3(
            startPos,
            midPoint,
            endPos
          );
          
          const points = curve.getPoints(20);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x6366f1,
            transparent: true,
            opacity: 0.3,
            linewidth: 1
          });
          
          const line = new THREE.Line(lineGeometry, lineMaterial);
          newMarkerGroup.add(line);
        }
      }
    });
    
  }, [networkUserCount]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-48 rounded-lg bg-black/20 border border-white/10"
    />
  );
};

export default GlobeVisualization;
