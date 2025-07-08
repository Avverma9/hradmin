import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const SuccessPopUp = ({ onComplete }) => {
  const [stage, setStage] = useState("setup"); // 'setup' -> 'success'
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const threeObjects = useRef({});

  // --- Styles ---
  // We embed the CSS directly using a style tag to ensure it's self-contained
  const styles = `
    .popup-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.6); display: flex;
      justify-content: center; align-items: center; z-index: 2000;
      backdrop-filter: blur(5px);
    }
    .popup-box {
      background: #ffffff; padding: 30px 40px; border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15); text-align: center;
      width: 90%; max-width: 360px; transform: scale(0.95);
      opacity: 0; animation: fadeInScaleUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes fadeInScaleUp {
      to { transform: scale(1); opacity: 1; }
    }
    .popup-icon-container {
      margin-bottom: 25px; height: 100px; display: flex;
      justify-content: center; align-items: center; position: relative;
    }
    #three-canvas-react {
      width: 150px; height: 150px; display: none; margin-top: -25px;
    }
    .success-checkmark {
      width: 80px; height: 80px; border-radius: 50%; display: block;
      stroke-width: 3; stroke: #fff; stroke-miterlimit: 10; margin: 0 auto;
      box-shadow: inset 0px 0px 0px #28a745;
      animation: fill .4s ease-in-out .4s forwards, scale-up .3s ease-in-out .9s both;
    }
    .check-icon {
      stroke-dasharray: 48; stroke-dashoffset: 48;
      animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
    }
    @keyframes stroke { 100% { stroke-dashoffset: 0; } }
    @keyframes scale-up { 0% { transform: scale(0); } 60% { transform: scale(1.15); } 100% { transform: scale(1); } }
    @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 40px #28a745; } }
    #popup-title {
      margin: 10px 0 5px; font-size: 24px; font-weight: 600; color: #333;
    }
    #popup-message {
      font-size: 16px; color: #666; min-height: 40px;
    }
  `;

  // --- Three.js Logic ---
  useEffect(() => {
    const initThreeJS = () => {
      if (!canvasRef.current) return;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      camera.position.z = 2.5;
      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(150, 150);
      renderer.setPixelRatio(window.devicePixelRatio);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0x87ceeb, 1, 100);
      pointLight.position.set(0, 5, 5);
      scene.add(pointLight);

      const geometry = new THREE.IcosahedronGeometry(1, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.9,
        emissive: 0x33a1c9,
        emissiveIntensity: 0.5,
        metalness: 0.2,
        roughness: 0.1,
      });
      const crystal = new THREE.Mesh(geometry, material);
      scene.add(crystal);
      threeObjects.current = { renderer, scene, camera, crystal };
    };
    initThreeJS();
  }, []);

  // --- Animation and State Machine ---
  useEffect(() => {
    const { renderer, scene, camera, crystal } = threeObjects.current;

    const animate = () => {
      if (crystal) {
        crystal.rotation.x += 0.005;
        crystal.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    if (stage === "setup") {
      if (canvasRef.current) canvasRef.current.style.display = "block";
      animationFrameId.current = requestAnimationFrame(animate);
      const timer = setTimeout(() => {
        setStage("success");
      }, 3000); // User requested 5 seconds
      return () => clearTimeout(timer);
    }

    if (stage === "success") {
      if (animationFrameId.current)
        cancelAnimationFrame(animationFrameId.current);
      if (canvasRef.current) canvasRef.current.style.display = "none";
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500); // Wait for checkmark animation
      return () => clearTimeout(timer);
    }
  }, [stage, onComplete]);

  return (
    <>
      <style>{styles}</style>
      <div className="popup-overlay">
        <div className="popup-box">
          <div className="popup-icon-container">
            {stage === "setup" && (
              <canvas ref={canvasRef} id="three-canvas-react" />
            )}
            {stage === "success" && (
              <div className="success-checkmark">
                <svg
                  className="check-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 52 52"
                >
                  <circle
                    className="checkmark-circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className="checkmark-check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
            )}
          </div>
          <h2 id="popup-title">Operation Successful!</h2>
          <p id="popup-message">
            {stage === "setup"
              ? "Sending a confirmation email..."
              : "Successfully sent"}
          </p>
        </div>
      </div>
    </>
  );
};
