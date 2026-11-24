'use client';
// src/components/3d/PerfumeViewer.tsx — SR Essences · Visor 3D Showroom (Cristal Tallado Grabado SR Essences + Foto HD + Film)
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { usePerfumeStore } from '@/hooks/usePerfumeStore';
import { HD_CATALOG_IMAGES } from '@/data/hdCatalogImages';
import { withBasePath } from '@/lib/assetPath';

export interface PerfumeViewerProps {
  variant?: 'cinematic' | 'modal';
}

function getCinematicCamera(aspect: number): { fov: number; z: number; y: number } {
  if (aspect < 0.45) return { fov: 58, z: 6.0, y: 0.12 };
  if (aspect < 0.62) return { fov: 53, z: 5.75, y: 0.14 };
  if (aspect < 0.85) return { fov: 47, z: 5.55, y: 0.15 };
  if (aspect < 1.15) return { fov: 43, z: 5.55, y: 0.15 };
  if (aspect > 2.1) return { fov: 38, z: 5.9, y: 0.12 };
  return { fov: 40, z: 5.55, y: 0.15 };
}

function getModalCamera(aspect: number): { fov: number; z: number; y: number } {
  if (aspect < 0.8) return { fov: 40, z: 5.25, y: 0.3 };
  if (aspect > 1.5) return { fov: 38, z: 5.35, y: 0.3 };
  return { fov: 35, z: 4.95, y: 0.3 };
}

function createChamferedRectShape(w: number, d: number, chamfer: number): THREE.Shape {
  const hw = w / 2;
  const hd = d / 2;
  const c = Math.min(chamfer, hw * 0.45, hd * 0.45);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + c, -hd);
  shape.lineTo(hw - c, -hd);
  shape.lineTo(hw, -hd + c);
  shape.lineTo(hw, hd - c);
  shape.lineTo(hw - c, hd);
  shape.lineTo(-hw + c, hd);
  shape.lineTo(-hw, hd - c);
  shape.lineTo(-hw, -hd + c);
  shape.closePath();
  return shape;
}

function createVerticalChamferBox(
  w: number,
  h: number,
  d: number,
  chamfer: number,
  bevelSize = 0.035,
  bevelThickness = 0.04
): THREE.ExtrudeGeometry {
  const shape = createChamferedRectShape(w, d, chamfer);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize,
    bevelThickness,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeBoundingBox();
  if (geo.boundingBox) {
    const center = new THREE.Vector3();
    geo.boundingBox.getCenter(center);
    geo.translate(-center.x, -center.y, -center.z);
  }
  return geo;
}

function createKintsugiMarbleTexture(isDark: boolean): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  if (isDark) {
    baseGrad.addColorStop(0, '#0c0b0a');
    baseGrad.addColorStop(0.5, '#15120f');
    baseGrad.addColorStop(1, '#080706');
  } else {
    baseGrad.addColorStop(0, '#f7f5f0');
    baseGrad.addColorStop(0.5, '#ebe6dd');
    baseGrad.addColorStop(1, '#f3efe8');
  }
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 42; i++) {
    const x = (Math.sin(i * 19.3) * 0.5 + 0.5) * size;
    const y = (Math.cos(i * 31.7) * 0.5 + 0.5) * size;
    const r = 120 + (i % 5) * 65;
    const g = ctx.createRadialGradient(x, y, 5, x, y, r);
    if (isDark) {
      g.addColorStop(0, 'rgba(55, 48, 42, 0.22)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      g.addColorStop(0, 'rgba(130, 125, 118, 0.14)');
      g.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  for (let v = 0; v < 14; v++) {
    ctx.beginPath();
    let vx = (v * 137) % size;
    let vy = 0;
    ctx.moveTo(vx, vy);
    for (let step = 0; step < 30; step++) {
      vx += Math.sin(step * 0.7 + v * 2.1) * 32 + 12;
      vy += size / 28;
      ctx.lineTo(vx, vy);
    }
    ctx.strokeStyle = isDark
      ? `rgba(110, 98, 82, ${0.14 + (v % 3) * 0.08})`
      : `rgba(88, 84, 80, ${0.14 + (v % 4) * 0.08})`;
    ctx.lineWidth = 1.5 + (v % 4) * 1.4;
    ctx.stroke();

    if (v % 2 === 0) {
      ctx.beginPath();
      let gx = ((v * 137) % size) + 6;
      let gy = 0;
      ctx.moveTo(gx, gy);
      for (let step = 0; step < 30; step++) {
        gx += Math.sin(step * 0.7 + v * 2.1) * 32 + 12;
        gy += size / 28;
        ctx.lineTo(gx, gy);
        for (let s = 0; s < 5; s++) {
          const sx = gx + Math.sin(step * 9 + s * 4 + v) * 14;
          const sy = gy + Math.cos(step * 7 + s * 3 + v) * 14;
          ctx.fillStyle = `rgba(218, 174, 68, ${0.45 + ((s + v) % 4) * 0.14})`;
          ctx.fillRect(sx, sy, 2.2, 2.2);
        }
      }
      ctx.strokeStyle = isDark ? 'rgba(222, 180, 74, 0.58)' : 'rgba(196, 150, 44, 0.65)';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  }

  for (let d = 0; d < 650; d++) {
    const dx = Math.abs(Math.sin(d * 12.9898) * 43758.5453) % 1;
    const dy = Math.abs(Math.sin(d * 78.233) * 43758.5453) % 1;
    const radius = 0.8 + (d % 4) * 0.7;
    ctx.beginPath();
    ctx.arc(dx * size, dy * size, radius, 0, Math.PI * 2);
    ctx.fillStyle = d % 3 === 0 ? 'rgba(255, 232, 152, 0.78)' : 'rgba(194, 148, 46, 0.55)';
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Etiqueta frontal grabada en cristal con tipografía SR Essences (estilo Maison original) */
function drawCrystalEngravedLabel(
  canvas: HTMLCanvasElement,
  perfumeName: string,
  concentration: string,
  isDark: boolean
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Velo sutil de cristal satinado para legibilidad impecable sin tapar el perfume interior
  const veil = ctx.createLinearGradient(0, 0, 0, h);
  if (isDark) {
    veil.addColorStop(0, 'rgba(12, 10, 8, 0.44)');
    veil.addColorStop(0.5, 'rgba(8, 7, 5, 0.56)');
    veil.addColorStop(1, 'rgba(12, 10, 8, 0.46)');
  } else {
    veil.addColorStop(0, 'rgba(255, 252, 246, 0.64)');
    veil.addColorStop(0.5, 'rgba(252, 248, 240, 0.74)');
    veil.addColorStop(1, 'rgba(248, 242, 230, 0.64)');
  }

  ctx.fillStyle = veil;
  ctx.beginPath();
  ctx.roundRect(w * 0.055, h * 0.045, w * 0.89, h * 0.91, 18);
  ctx.fill();

  // Gradiente metálico principal (oro champán en noche, bronce-obsidiana en luz)
  const goldGrad = ctx.createLinearGradient(w * 0.15, h * 0.1, w * 0.85, h * 0.9);
  if (isDark) {
    goldGrad.addColorStop(0, '#c89b3c');
    goldGrad.addColorStop(0.35, '#fff0b8');
    goldGrad.addColorStop(0.65, '#ddb352');
    goldGrad.addColorStop(1, '#b88928');
  } else {
    goldGrad.addColorStop(0, '#1e1810');
    goldGrad.addColorStop(0.45, '#3b2c16');
    goldGrad.addColorStop(0.75, '#7a591c');
    goldGrad.addColorStop(1, '#1a140c');
  }

  // Doble marco arquitectónico grabado
  ctx.strokeStyle = isDark ? 'rgba(232, 196, 108, 0.78)' : 'rgba(166, 122, 34, 0.72)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(w * 0.055, h * 0.045, w * 0.89, h * 0.91, 18);
  ctx.stroke();

  ctx.strokeStyle = isDark ? 'rgba(232, 196, 108, 0.36)' : 'rgba(166, 122, 34, 0.34)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(w * 0.085, h * 0.072, w * 0.83, h * 0.856, 10);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Encabezado Maison
  ctx.font = '500 28px "Montserrat", sans-serif';
  ctx.fillStyle = isDark ? 'rgba(244, 218, 146, 0.88)' : 'rgba(138, 98, 24, 0.92)';
  ctx.fillText('M A I S O N', w / 2, h * 0.165);

  // Monograma SR en serif editorial
  ctx.font = '500 230px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = goldGrad;
  ctx.fillText('SR', w / 2, h * 0.355);

  // Firma caligráfica Essences
  ctx.font = '400 124px "Great Vibes", cursive';
  ctx.fillStyle = isDark ? '#f7df94' : '#9c711c';
  ctx.fillText('Essences', w / 2, h * 0.515);

  // Línea divisoria fina con rombo central
  const lineY = h * 0.615;
  ctx.strokeStyle = isDark ? 'rgba(232, 196, 108, 0.52)' : 'rgba(166, 122, 34, 0.48)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.18, lineY);
  ctx.lineTo(w * 0.45, lineY);
  ctx.moveTo(w * 0.55, lineY);
  ctx.lineTo(w * 0.82, lineY);
  ctx.stroke();

  ctx.fillStyle = isDark ? '#f3d584' : '#a87a20';
  ctx.beginPath();
  ctx.moveTo(w / 2, lineY - 9);
  ctx.lineTo(w / 2 + 9, lineY);
  ctx.lineTo(w / 2, lineY + 9);
  ctx.lineTo(w / 2 - 9, lineY);
  ctx.closePath();
  ctx.fill();

  // Nombre del perfume activo (ajuste dinámico de tamaño)
  const cleanName = perfumeName.length > 22 ? `${perfumeName.slice(0, 20)}…` : perfumeName;
  const nameSize = cleanName.length > 16 ? 52 : 62;
  ctx.font = `600 ${nameSize}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillStyle = goldGrad;
  ctx.fillText(cleanName.toUpperCase(), w / 2, h * 0.715);

  // Concentración y sello
  ctx.font = '500 25px "Montserrat", sans-serif';
  ctx.fillStyle = isDark ? 'rgba(244, 218, 146, 0.88)' : 'rgba(116, 84, 24, 0.92)';
  ctx.fillText(`${concentration.toUpperCase()}  ·  HAUTE PARFUMERIE`, w / 2, h * 0.795);

  // Volumen inferior sutil
  ctx.font = '400 22px "Montserrat", sans-serif';
  ctx.fillStyle = isDark ? 'rgba(218, 196, 152, 0.62)' : 'rgba(92, 76, 52, 0.66)';
  ctx.fillText('100 ML  ·  3.4 FL. OZ.', w / 2, h * 0.875);
}

function createStudioEnvTexture(isDark: boolean): THREE.CanvasTexture {
  const envC = document.createElement('canvas');
  envC.width = 1024;
  envC.height = 512;
  const ctx = envC.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 0, 512);
  if (isDark) {
    bg.addColorStop(0, '#1f1810');
    bg.addColorStop(0.45, '#0b0907');
    bg.addColorStop(1, '#030303');
  } else {
    bg.addColorStop(0, '#fffdf7');
    bg.addColorStop(0.45, '#efe6d5');
    bg.addColorStop(1, '#d8cbb5');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);

  [180, 420, 620, 860].forEach((ax, idx) => {
    const g = ctx.createLinearGradient(ax - 45, 40, ax + 45, 360);
    if (idx % 2 === 0) {
      g.addColorStop(0, isDark ? 'rgba(255, 240, 200, 0.75)' : 'rgba(255, 255, 255, 0.98)');
      g.addColorStop(1, isDark ? 'rgba(201, 168, 76, 0.15)' : 'rgba(245, 226, 178, 0.35)');
    } else {
      g.addColorStop(0, isDark ? 'rgba(240, 200, 120, 0.55)' : 'rgba(255, 246, 218, 0.92)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(ax - 34, 55, 68, 280, [34, 34, 4, 4]);
    ctx.fill();
  });

  const tex = new THREE.CanvasTexture(envC);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function PerfumeViewer({ variant = 'cinematic' }: PerfumeViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, dispatch } = usePerfumeStore();
  const { activePerfume, ui } = state;
  const isNocturne = ui.ambiance === 'nocturne';
  const realImageUrl = withBasePath(HD_CATALOG_IMAGES[activePerfume.id] || activePerfume.imageUrl || '');
  const hasRealImage = Boolean(realImageUrl);
  const effectiveMode =
    variant === 'cinematic'
      ? ui.viewerMode === 'film'
        ? 'film'
        : 'crystal3d'
      : ui.viewerMode === 'real3d' && !hasRealImage
      ? 'crystal3d'
      : ui.viewerMode;

  const currentPerfRef = useRef(activePerfume);
  currentPerfRef.current = activePerfume;
  const currentRealImageUrlRef = useRef(realImageUrl);
  currentRealImageUrlRef.current = realImageUrl;
  const isNocturneRef = useRef(isNocturne);
  isNocturneRef.current = isNocturne;
  const effectiveModeRef = useRef(effectiveMode);
  effectiveModeRef.current = effectiveMode;
  const variantRef = useRef(variant);
  variantRef.current = variant;

  const liquidMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const liquidTargetColor = useRef(new THREE.Color(activePerfume.liquidColor));
  const liquidTargetEmissive = useRef(new THREE.Color(activePerfume.liquidColorAlt));
  const accentLightRef = useRef<THREE.PointLight | null>(null);

  const labelCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const labelTexRef = useRef<THREE.CanvasTexture | null>(null);

  const crystalGrpRef = useRef<THREE.Group | null>(null);
  const realStageGrpRef = useRef<THREE.Group | null>(null);
  const realPlaneMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const realPlaneMeshRef = useRef<THREE.Mesh | null>(null);
  const currentLoadedUrlRef = useRef<string>('');
  const realTexRef = useRef<THREE.Texture | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const pedestalMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const capMatRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const smokeMatRef = useRef<THREE.PointsMaterial | null>(null);
  const particlesMatRef = useRef<THREE.PointsMaterial | null>(null);
  const marbleLightTexRef = useRef<THREE.CanvasTexture | null>(null);
  const marbleDarkTexRef = useRef<THREE.CanvasTexture | null>(null);
  const envLightTexRef = useRef<THREE.CanvasTexture | null>(null);
  const envDarkTexRef = useRef<THREE.CanvasTexture | null>(null);

  const [isLoaded, setIsLoaded] = useState(false);

  // Sincronizar líquido, etiqueta grabada y textura de foto referencia
  useEffect(() => {
    liquidTargetColor.current.set(activePerfume.liquidColor);
    liquidTargetEmissive.current.set(activePerfume.liquidColorAlt);
    if (accentLightRef.current) {
      accentLightRef.current.color.set(activePerfume.accentColor || '#c9a145');
    }
    if (labelCanvasRef.current && labelTexRef.current) {
      drawCrystalEngravedLabel(
        labelCanvasRef.current,
        activePerfume.name,
        activePerfume.concentration,
        isNocturne
      );
      labelTexRef.current.needsUpdate = true;
    }

    if (crystalGrpRef.current && realStageGrpRef.current) {
      const showReal = effectiveMode === 'real3d' && Boolean(realImageUrl);
      crystalGrpRef.current.visible = !showReal;
      realStageGrpRef.current.visible = showReal;
    }

    if (
      variant === 'modal' &&
      realImageUrl &&
      realImageUrl !== currentLoadedUrlRef.current &&
      realPlaneMatRef.current
    ) {
      const requestedUrl = realImageUrl;
      currentLoadedUrlRef.current = requestedUrl;
      const loader = new THREE.TextureLoader();
      loader.load(requestedUrl, (tex) => {
        if (currentLoadedUrlRef.current !== requestedUrl || !realPlaneMatRef.current) {
          tex.dispose();
          return;
        }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        if (realTexRef.current) realTexRef.current.dispose();
        realTexRef.current = tex;

        if (realPlaneMatRef.current && realPlaneMeshRef.current) {
          realPlaneMatRef.current.map = tex;
          realPlaneMatRef.current.needsUpdate = true;

          const img = tex.image as HTMLImageElement | undefined;
          if (img && img.width && img.height) {
            const aspect = img.width / img.height;
            const maxH = 2.05;
            const maxW = 2.25;
            let w = maxH * aspect;
            let h = maxH;
            if (w > maxW) {
              w = maxW;
              h = maxW / aspect;
            }
            realPlaneMeshRef.current.scale.set(w, h, 1);
          }
        }
      });
    }
    }, [activePerfume, effectiveMode, isNocturne, realImageUrl, variant]);

  // Sincronizar atmósfera (Palais Lumière <-> Noche Obsidiana) en vivo
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.environment = isNocturne ? envDarkTexRef.current : envLightTexRef.current;
    if (scene.fog instanceof THREE.FogExp2) {
      scene.fog.color.set(isNocturne ? 0x050403 : 0xf4eee4);
      scene.fog.density = isNocturne ? 0.03 : 0.014;
    }
    if (pedestalMatRef.current) {
      pedestalMatRef.current.map = isNocturne ? marbleDarkTexRef.current : marbleLightTexRef.current;
      pedestalMatRef.current.roughness = isNocturne ? 0.14 : 0.24;
      pedestalMatRef.current.metalness = isNocturne ? 0.35 : 0.12;
      pedestalMatRef.current.needsUpdate = true;
    }
    if (capMatRef.current) {
      if (isNocturne) {
        capMatRef.current.color.set(0xd9b355);
        capMatRef.current.transmission = 0.08;
        capMatRef.current.metalness = 0.94;
        capMatRef.current.roughness = 0.12;
      } else {
        capMatRef.current.color.set(0xfbf6eb);
        capMatRef.current.transmission = 0.82;
        capMatRef.current.metalness = 0.05;
        capMatRef.current.roughness = 0.05;
      }
      capMatRef.current.needsUpdate = true;
    }
    if (smokeMatRef.current) {
      smokeMatRef.current.blending = isNocturne ? THREE.AdditiveBlending : THREE.NormalBlending;
      smokeMatRef.current.opacity = isNocturne ? 0.11 : 0.22;
      smokeMatRef.current.color.set(isNocturne ? 0xe5d3b8 : 0xffffff);
      smokeMatRef.current.needsUpdate = true;
    }
    if (particlesMatRef.current) {
      particlesMatRef.current.blending = isNocturne ? THREE.AdditiveBlending : THREE.NormalBlending;
      particlesMatRef.current.color.set(isNocturne ? 0xffe28a : 0xd4a238);
      particlesMatRef.current.opacity = isNocturne ? 0.92 : 0.88;
      particlesMatRef.current.needsUpdate = true;
    }
    if (labelCanvasRef.current && labelTexRef.current) {
      drawCrystalEngravedLabel(
        labelCanvasRef.current,
        currentPerfRef.current.name,
        currentPerfRef.current.concentration,
        isNocturne
      );
      labelTexRef.current.needsUpdate = true;
    }
  }, [isNocturne]);

  // ——— MONTAJE ÚNICO DE ESCENA THREE.JS ———
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let rafId: number;
    let disposed = false;

    const W = container.clientWidth || 560;
    const H = container.clientHeight || 640;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const isCinematic = variantRef.current === 'cinematic';
    const initialAspect = W / H;
    const initCam = isCinematic ? getCinematicCamera(initialAspect) : getModalCamera(initialAspect);
    const camera = new THREE.PerspectiveCamera(
      initCam.fov,
      initialAspect,
      0.1,
      60
    );
    camera.position.set(
      isCinematic ? 0.18 : 0.22,
      isCinematic ? initCam.y : 0.3,
      initCam.z
    );
    let lastAutoZ = initCam.z;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const startDark = isNocturneRef.current;
    scene.fog = new THREE.FogExp2(startDark ? 0x050403 : 0xf4eee4, startDark ? 0.03 : 0.014);

    const envLightTex = createStudioEnvTexture(false);
    const envDarkTex = createStudioEnvTexture(true);
    envLightTexRef.current = envLightTex;
    envDarkTexRef.current = envDarkTex;
    scene.environment = startDark ? envDarkTex : envLightTex;

    const marbleLightTex = createKintsugiMarbleTexture(false);
    const marbleDarkTex = createKintsugiMarbleTexture(true);
    marbleLightTexRef.current = marbleLightTex;
    marbleDarkTexRef.current = marbleDarkTex;

    const controls = new OrbitControls(camera, canvas);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, isCinematic ? -0.1 : -0.08, 0);
    controls.minPolarAngle = Math.PI / 3.8;
    controls.maxPolarAngle = Math.PI / 1.85;
    controls.rotateSpeed = 0.55;
    controls.enableDamping = true;
    controls.dampingFactor = 0.045;

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4ad50,
      metalness: 0.96,
      roughness: 0.14,
      emissive: 0x6e4e10,
      emissiveIntensity: 0.12,
      envMapIntensity: 2.5,
    });

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.94,
      opacity: 1,
      transparent: true,
      roughness: 0.03,
      metalness: 0.0,
      ior: 1.54,
      thickness: 0.9,
      attenuationColor: new THREE.Color(0xfef7e6),
      attenuationDistance: 2.5,
      reflectivity: 0.85,
      envMapIntensity: 2.6,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
    });

    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(currentPerfRef.current.liquidColor),
      emissive: new THREE.Color(currentPerfRef.current.liquidColorAlt),
      emissiveIntensity: 0.28,
      roughness: 0.05,
      metalness: 0.04,
      transmission: 0.68,
      opacity: 0.94,
      transparent: true,
      ior: 1.36,
      thickness: 0.7,
      envMapIntensity: 2.0,
    });
    liquidMatRef.current = liquidMat;

    // ========== PEDESTAL DE MÁRMOL KINTSUGI ==========
    const plinthGrp = new THREE.Group();
    plinthGrp.position.y = -1.48;
    scene.add(plinthGrp);

    const plinthGeo = createVerticalChamferBox(2.35, 0.5, 1.5, 0.22, 0.055, 0.055);
    const plinthMat = new THREE.MeshStandardMaterial({
      map: startDark ? marbleDarkTex : marbleLightTex,
      roughness: startDark ? 0.14 : 0.24,
      metalness: startDark ? 0.35 : 0.12,
      envMapIntensity: 1.8,
    });
    pedestalMatRef.current = plinthMat;
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.receiveShadow = true;
    plinthGrp.add(plinthMesh);

    const trimGeo = createVerticalChamferBox(2.4, 0.015, 1.55, 0.22, 0.008, 0.008);
    const trimMesh = new THREE.Mesh(trimGeo, goldMat);
    trimMesh.position.y = 0.26;
    plinthGrp.add(trimMesh);

    // Grupo maestro flotante sobre el pedestal
    const stageGrp = new THREE.Group();
    stageGrp.position.y = -0.1;
    scene.add(stageGrp);

    // ========== A) ESCENARIO FOTO REFERENCIA (PARA MODO MODAL) ==========
    const realStageGrp = new THREE.Group();
    stageGrp.add(realStageGrp);
    realStageGrpRef.current = realStageGrp;

    const discGeo = new THREE.CylinderGeometry(0.95, 1.02, 0.04, 64);
    const discMesh = new THREE.Mesh(discGeo, goldMat);
    discMesh.position.y = -1.04;
    realStageGrp.add(discMesh);

    const haloRingGeo = new THREE.TorusGeometry(1.18, 0.012, 16, 96);
    const haloRing = new THREE.Mesh(haloRingGeo, goldMat);
    haloRing.position.set(0, 0.04, -0.18);
    realStageGrp.add(haloRing);

    const realPlaneGeo = new THREE.PlaneGeometry(1, 1);
    const realPlaneMat = new THREE.MeshStandardMaterial({
      transparent: true,
      alphaTest: 0.08,
      roughness: 0.28,
      metalness: 0.06,
      side: THREE.DoubleSide,
    });
    realPlaneMatRef.current = realPlaneMat;

    const realPlaneMesh = new THREE.Mesh(realPlaneGeo, realPlaneMat);
    realPlaneMesh.position.set(0, 0.02, 0.04);
    realPlaneMesh.scale.set(2.0, 2.0, 1);
    realPlaneMeshRef.current = realPlaneMesh;
    realStageGrp.add(realPlaneMesh);

    // ========== B) FRASCO CRISTAL TALLADO CON ETIQUETA GRABADA SR ESSENCES ==========
    const crystalGrp = new THREE.Group();
    stageGrp.add(crystalGrp);
    crystalGrpRef.current = crystalGrp;

    const outerGlassGeo = createVerticalChamferBox(1.36, 1.64, 0.78, 0.17, 0.05, 0.05);
    const outerGlassMesh = new THREE.Mesh(outerGlassGeo, crystalMat);
    outerGlassMesh.castShadow = true;
    outerGlassMesh.renderOrder = 2;
    crystalGrp.add(outerGlassMesh);

    const heelGeo = createVerticalChamferBox(1.24, 0.15, 0.66, 0.13, 0.02, 0.02);
    const heelMesh = new THREE.Mesh(heelGeo, crystalMat);
    heelMesh.position.y = -0.74;
    crystalGrp.add(heelMesh);

    const innerLiquidGeo = createVerticalChamferBox(1.1, 1.2, 0.56, 0.11, 0.025, 0.025);
    const innerLiquidMesh = new THREE.Mesh(innerLiquidGeo, liquidMat);
    innerLiquidMesh.position.y = 0.04;
    innerLiquidMesh.renderOrder = 1;
    crystalGrp.add(innerLiquidMesh);

    const tubeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.8, 0),
      new THREE.Vector3(-0.02, 0.32, 0.02),
      new THREE.Vector3(-0.13, -0.24, 0.04),
      new THREE.Vector3(-0.3, -0.54, 0.08),
    ]);
    const tubeGeo = new THREE.TubeGeometry(tubeCurve, 24, 0.014, 10, false);
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xfef9ec,
      transmission: 0.75,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
    });
    crystalGrp.add(new THREE.Mesh(tubeGeo, tubeMat));

    // Etiqueta frontal grabada directamente sobre la cara de cristal (diseño original SR Essences)
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 1024;
    labelCanvas.height = 1280;
    drawCrystalEngravedLabel(
      labelCanvas,
      currentPerfRef.current.name,
      currentPerfRef.current.concentration,
      startDark
    );
    labelCanvasRef.current = labelCanvas;

    const labelTex = new THREE.CanvasTexture(labelCanvas);
    labelTex.colorSpace = THREE.SRGBColorSpace;
    labelTex.anisotropy = 8;
    labelTexRef.current = labelTex;

    const labelGeo = new THREE.PlaneGeometry(1.02, 1.24);
    const labelMat = new THREE.MeshStandardMaterial({
      map: labelTex,
      transparent: true,
      roughness: 0.24,
      metalness: 0.42,
      emissive: new THREE.Color(0x3a2808),
      emissiveIntensity: 0.14,
      depthWrite: false,
    });
    const labelMesh = new THREE.Mesh(labelGeo, labelMat);
    labelMesh.position.set(0, 0.02, 0.444);
    labelMesh.renderOrder = 3;
    crystalGrp.add(labelMesh);

    const redrawTypography = () => {
      if (disposed) return;
      drawCrystalEngravedLabel(
        labelCanvas,
        currentPerfRef.current.name,
        currentPerfRef.current.concentration,
        isNocturneRef.current
      );
      labelTex.needsUpdate = true;
    };
    document.fonts?.ready.then(redrawTypography);

    // Cuello y tapón arquitectónico
    const neckGlassGeo = new THREE.CylinderGeometry(0.17, 0.25, 0.15, 48);
    const neckGlass = new THREE.Mesh(neckGlassGeo, crystalMat);
    neckGlass.position.y = 0.91;
    crystalGrp.add(neckGlass);

    const collarBaseGeo = new THREE.CylinderGeometry(0.21, 0.22, 0.15, 48);
    const collarBase = new THREE.Mesh(collarBaseGeo, goldMat);
    collarBase.position.y = 1.02;
    crystalGrp.add(collarBase);

    const capGrp = new THREE.Group();
    capGrp.position.y = 1.38;
    crystalGrp.add(capGrp);

    const capGeo = createVerticalChamferBox(0.55, 0.42, 0.45, 0.08, 0.025, 0.025);
    const capMat = new THREE.MeshPhysicalMaterial({
      color: startDark ? 0xd9b355 : 0xfbf6eb,
      transmission: startDark ? 0.08 : 0.82,
      metalness: startDark ? 0.94 : 0.05,
      roughness: startDark ? 0.12 : 0.05,
      ior: 1.52,
      envMapIntensity: 2.8,
      clearcoat: 1.0,
    });
    capMatRef.current = capMat;
    capGrp.add(new THREE.Mesh(capGeo, capMat));

    const capCoreGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.32, 32);
    const capCore = new THREE.Mesh(capCoreGeo, goldMat);
    capCore.position.y = -0.02;
    capGrp.add(capCore);

    // Visibilidad inicial según variante y modo
    const startRealUrl = currentRealImageUrlRef.current;
    const startReal =
      !isCinematic &&
      effectiveModeRef.current === 'real3d' &&
      Boolean(startRealUrl);
    crystalGrp.visible = !startReal;
    realStageGrp.visible = startReal;

    if (!isCinematic && startRealUrl) {
      currentLoadedUrlRef.current = startRealUrl;
      new THREE.TextureLoader().load(startRealUrl, (tex) => {
        if (disposed) { tex.dispose(); return; }
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        realTexRef.current = tex;
        realPlaneMat.map = tex;
        realPlaneMat.needsUpdate = true;
        const img = tex.image as HTMLImageElement | undefined;
        if (img && img.width && img.height) {
          const aspect = img.width / img.height;
          const maxH = 2.05;
          const maxW = 2.25;
          let w = maxH * aspect;
          let h = maxH;
          if (w > maxW) { w = maxW; h = maxW / aspect; }
          realPlaneMesh.scale.set(w, h, 1);
        }
      });
    }

    // ========== PARTÍCULAS DORADAS ==========
    const PART_COUNT = 300;
    const pPos = new Float32Array(PART_COUNT * 3);
    const pAngle = new Float32Array(PART_COUNT);
    const pRadii = new Float32Array(PART_COUNT);
    const pVelY = new Float32Array(PART_COUNT);

    for (let i = 0; i < PART_COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.7 + Math.random() * 2.2;
      pPos[i * 3] = Math.cos(a) * r;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
      pPos[i * 3 + 2] = Math.sin(a) * r;
      pAngle[i] = a;
      pRadii[i] = r;
      pVelY[i] = 0.0016 + Math.random() * 0.0024;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pCanvas = document.createElement('canvas');
    pCanvas.width = pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    const pGrad = pCtx.createRadialGradient(32, 32, 1, 32, 32, 30);
    pGrad.addColorStop(0, 'rgba(255, 248, 200, 1)');
    pGrad.addColorStop(0.3, 'rgba(232, 190, 88, 0.85)');
    pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = pGrad;
    pCtx.fillRect(0, 0, 64, 64);
    const pTex = new THREE.CanvasTexture(pCanvas);

    const pMat = new THREE.PointsMaterial({
      size: 0.075,
      map: pTex,
      transparent: true,
      opacity: startDark ? 0.92 : 0.88,
      blending: startDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      sizeAttenuation: true,
      color: startDark ? 0xffe28a : 0xd4a238,
    });
    particlesMatRef.current = pMat;
    scene.add(new THREE.Points(pGeo, pMat));

    // ========== HUMO SEDOSO ==========
    const SMOKE_COUNT = 38;
    const sPos = new Float32Array(SMOKE_COUNT * 3);
    const sOffset = new Float32Array(SMOKE_COUNT);
    for (let i = 0; i < SMOKE_COUNT; i++) {
      const a = (i / SMOKE_COUNT) * Math.PI * 2;
      const r = 0.8 + Math.random() * 0.85;
      sPos[i * 3] = Math.cos(a) * r;
      sPos[i * 3 + 1] = -1.2 + Math.random() * 2.4;
      sPos[i * 3 + 2] = Math.sin(a) * r;
      sOffset[i] = Math.random() * Math.PI * 2;
    }

    const smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));

    const smCanvas = document.createElement('canvas');
    smCanvas.width = smCanvas.height = 128;
    const smCtx = smCanvas.getContext('2d')!;
    const smGrad = smCtx.createRadialGradient(64, 64, 4, 64, 64, 62);
    smGrad.addColorStop(0, 'rgba(255, 252, 245, 0.72)');
    smGrad.addColorStop(0.45, 'rgba(240, 228, 204, 0.25)');
    smGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    smCtx.fillStyle = smGrad;
    smCtx.fillRect(0, 0, 128, 128);
    const smTex = new THREE.CanvasTexture(smCanvas);

    const smokeMat = new THREE.PointsMaterial({
      size: 1.05,
      map: smTex,
      transparent: true,
      opacity: startDark ? 0.11 : 0.22,
      blending: startDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
      color: startDark ? 0xe5d3b8 : 0xffffff,
    });
    smokeMatRef.current = smokeMat;
    scene.add(new THREE.Points(smokeGeo, smokeMat));

    // ========== ILUMINACIÓN DE ESTUDIO ==========
    scene.add(new THREE.AmbientLight(0xffffff, 1.35));

    const keyLight = new THREE.SpotLight(0xfff4da, 85);
    keyLight.position.set(3.6, 5.5, 4.0);
    keyLight.angle = 0.48;
    keyLight.penumbra = 0.85;
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.SpotLight(0xf0f4ff, 42);
    fillLight.position.set(-4.4, 3.2, 3.0);
    fillLight.angle = 0.65;
    fillLight.penumbra = 1;
    scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xffe6a8, 40);
    rimLight.position.set(0.4, 2.0, -4.5);
    rimLight.angle = 0.55;
    rimLight.penumbra = 0.9;
    scene.add(rimLight);

    const accentLight = new THREE.PointLight(
      new THREE.Color(currentPerfRef.current.accentColor || '#c9a145'),
      4.5,
      4.5,
      2
    );
    accentLight.position.set(0, 0.1, 2.2);
    scene.add(accentLight);
    accentLightRef.current = accentLight;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    let userDragging = false;
    const onControlStart = () => { userDragging = true; };
    const onControlEnd = () => { userDragging = false; };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    const onResize = () => {
      if (disposed || !container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      const aspect = w / h;
      const nextCam = isCinematic ? getCinematicCamera(aspect) : getModalCamera(aspect);
      camera.aspect = aspect;
      camera.fov = nextCam.fov;
      if (!userDragging && lastAutoZ > 0) {
        const ratio = nextCam.z / lastAutoZ;
        if (Math.abs(ratio - 1) > 0.01) {
          camera.position.sub(controls.target).multiplyScalar(ratio).add(controls.target);
        }
        if (isCinematic) {
          camera.position.y = nextCam.y;
        }
        lastAutoZ = nextCam.z;
      }
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);
    setIsLoaded(true);

    const clock = new THREE.Clock();
    const animate = () => {
      if (disposed) return;
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      controls.update();

      const motionScale = reducedMotion ? 0.12 : 1;
      stageGrp.position.y = -0.1 + Math.sin(t * 0.85) * 0.03 * motionScale;
      stageGrp.rotation.y = Math.sin(t * 0.42) * 0.22 * motionScale;
      haloRing.rotation.z = t * 0.18 * motionScale;

      if (liquidMatRef.current) {
        liquidMatRef.current.color.lerp(liquidTargetColor.current, 0.06);
        liquidMatRef.current.emissive.lerp(liquidTargetEmissive.current, 0.06);
      }

      const pa = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < PART_COUNT; i++) {
        const i3 = i * 3;
        pAngle[i] += (0.002 + (i % 3) * 0.0006) * motionScale;
        const r = pRadii[i] + Math.sin(t * 0.65 + i) * 0.08 * motionScale;
        pa[i3] = Math.cos(pAngle[i]) * r;
        pa[i3 + 1] += pVelY[i] * motionScale;
        pa[i3 + 2] = Math.sin(pAngle[i]) * r;
        if (pa[i3 + 1] > 2.3) {
          pa[i3 + 1] = -2.1;
          pRadii[i] = 0.7 + Math.random() * 2.2;
        }
      }
      pGeo.attributes.position.needsUpdate = true;

      const sa = smokeGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < SMOKE_COUNT; i++) {
        const i3 = i * 3;
        sa[i3] += Math.sin(t * 0.45 + sOffset[i]) * 0.002 * motionScale;
        sa[i3 + 1] += 0.003 * motionScale;
        sa[i3 + 2] += Math.cos(t * 0.45 + sOffset[i]) * 0.002 * motionScale;
        if (sa[i3 + 1] > 1.6) {
          const a = Math.random() * Math.PI * 2;
          const r = 0.8 + Math.random() * 0.85;
          sa[i3] = Math.cos(a) * r;
          sa[i3 + 1] = -1.25;
          sa[i3 + 2] = Math.sin(a) * r;
        }
      }
      smokeGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('end', onControlEnd);
      controls.dispose();
      renderer.dispose();
      [
        plinthGeo,
        trimGeo,
        discGeo,
        haloRingGeo,
        realPlaneGeo,
        outerGlassGeo,
        heelGeo,
        innerLiquidGeo,
        tubeGeo,
        labelGeo,
        neckGlassGeo,
        collarBaseGeo,
        capGeo,
        capCoreGeo,
        pGeo,
        smokeGeo,
      ].forEach((g) => g.dispose());
      [
        goldMat,
        crystalMat,
        liquidMat,
        plinthMat,
        realPlaneMat,
        tubeMat,
        labelMat,
        capMat,
        pMat,
        smokeMat,
      ].forEach((m) => m.dispose());
      [
        envLightTex,
        envDarkTex,
        marbleLightTex,
        marbleDarkTex,
        labelTex,
        pTex,
        smTex,
      ].forEach((tx) => tx.dispose());
      if (realTexRef.current) realTexRef.current.dispose();
    };
  }, []);

  const videoSrc = withBasePath(isNocturne ? '/videos/perfume-reference.mp4' : '/videos/perfume-lumiere.mp4');

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden select-none">
      {/* Fondo de escenario (Palais Lumière vs Noche Obsidiana) */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ${
          isNocturne ? 'stage-nocturne' : 'stage-lumiere'
        }`}
      />

      {/* Arcos arquitectónicos Palais */}
      <div
        className="absolute inset-x-0 top-6 bottom-20 flex justify-center items-end gap-5 px-6 pointer-events-none opacity-60"
        aria-hidden
      >
        {[0.82, 1, 0.82].map((scale, idx) => (
          <div
            key={idx}
            className="palais-arch h-full max-w-[205px] flex-1"
            style={{ transform: `scaleY(${scale})`, transformOrigin: 'bottom center' }}
          />
        ))}
      </div>

      {/* Aura cromática del perfume activo */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 55% 55% at 50% 48%, ${activePerfume.glowColor} 0%, transparent 72%)`,
          opacity: isNocturne ? 0.42 : 0.22,
        }}
      />

      {/* Video de campaña atmosférica */}
      {effectiveMode === 'film' && (
        <div className="absolute inset-0 z-10">
          <video
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isNocturne
                ? 'radial-gradient(ellipse at center, transparent 45%, rgba(5,5,4,0.68) 100%)'
                : 'radial-gradient(ellipse at center, transparent 52%, rgba(247,243,236,0.58) 100%)',
            }}
          />
        </div>
      )}

      {/* Canvas WebGL Interactivo */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full touch-none cursor-grab active:cursor-grabbing outline-none z-10 transition-opacity duration-500 ${
          effectiveMode === 'film' ? 'opacity-0 pointer-events-none' : isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* En modo modal mostramos pista de rotación + switcher limpio en la parte inferior */}
      {variant === 'modal' && (
        <div className="absolute bottom-3 sm:bottom-4 inset-x-3 sm:inset-x-4 z-20 flex flex-col items-center text-center gap-1.5 sm:gap-2 pointer-events-none">
          {effectiveMode !== 'film' && (
            <p
              className="font-sans text-[9px] sm:text-[10px] font-light tracking-[0.22em] sm:tracking-[0.26em] uppercase opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              ⟳ Arrastra para rotar 360°
            </p>
          )}

          <div className="surface-card p-1 flex flex-wrap justify-center items-center gap-1 max-w-full pointer-events-auto">
            <button
              onClick={() => dispatch({ type: 'SET_VIEWER_MODE', mode: 'crystal3d' })}
              className="px-2.5 sm:px-3 py-1.5 font-sans text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.16em] uppercase transition-all cursor-pointer"
              style={{
                background: effectiveMode === 'crystal3d' ? 'var(--gold)' : 'transparent',
                color: effectiveMode === 'crystal3d' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: effectiveMode === 'crystal3d' ? 600 : 400,
              }}
            >
              Frasco 3D SR
            </button>
            {hasRealImage && (
              <button
                onClick={() => dispatch({ type: 'SET_VIEWER_MODE', mode: 'real3d' })}
                className="px-2.5 sm:px-3 py-1.5 font-sans text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.16em] uppercase transition-all cursor-pointer"
                style={{
                  background: effectiveMode === 'real3d' ? 'var(--gold)' : 'transparent',
                  color: effectiveMode === 'real3d' ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: effectiveMode === 'real3d' ? 600 : 400,
                }}
              >
                Foto Referencia
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'SET_VIEWER_MODE', mode: 'film' })}
              className="px-2.5 sm:px-3 py-1.5 font-sans text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.16em] uppercase transition-all cursor-pointer"
              style={{
                background: effectiveMode === 'film' ? 'var(--gold)' : 'transparent',
                color: effectiveMode === 'film' ? '#ffffff' : 'var(--text-muted)',
                fontWeight: effectiveMode === 'film' ? 600 : 400,
              }}
            >
              Film Maison
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
