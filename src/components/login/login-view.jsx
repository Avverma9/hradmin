import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import * as THREE from "three";

// MUI Imports
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import { alpha, useTheme } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";

// Other Imports
import { toast } from "react-toastify";
import { bgGradient } from "../../../theme/css";
import Logo from "../../../src/components/stuff/logo";
import Iconify from "../../../src/components/stuff/iconify";
import { useRouter } from "../routes/hooks";
import { localUrl } from "../../../utils/util";

// ======================================================================
// --- NEW: Login Success Popup Component ---
// ======================================================================

const LoginSuccessPopup = ({ onComplete }) => {
  const [stage, setStage] = useState("setup"); // 'setup' -> 'success'
  const [webglAvailable, setWebglAvailable] = useState(true);
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
    .setup-fallback {
      width: 84px; height: 84px; border-radius: 50%;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      color: #1976d2; display: flex; align-items: center; justify-content: center;
      font-size: 36px; font-weight: 700;
      animation: pulse 1.2s ease-in-out infinite;
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
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.06); opacity: 0.85; }
    }
    #popup-title {
      margin: 10px 0 5px; font-size: 24px; font-weight: 600; color: #333;
    }
    #popup-message {
      font-size: 16px; color: #666; min-height: 40px;
    }
  `;

  // --- Three.js Logic ---
  useEffect(() => {
    let renderer;
    let geometry;
    let material;

    const initThreeJS = () => {
      if (!canvasRef.current) return;
      try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 2.5;
        renderer = new THREE.WebGLRenderer({
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

        geometry = new THREE.IcosahedronGeometry(1, 0);
        material = new THREE.MeshStandardMaterial({
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
        threeObjects.current = { renderer, scene, camera, crystal, geometry, material };
        setWebglAvailable(true);
      } catch (error) {
        console.warn("Login success animation disabled: WebGL unavailable.", error);
        threeObjects.current = {};
        setWebglAvailable(false);
      }
    };

    initThreeJS();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      const current = threeObjects.current;
      current.geometry?.dispose?.();
      current.material?.dispose?.();
      current.renderer?.dispose?.();
      threeObjects.current = {};
    };
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
      if (canvasRef.current && webglAvailable) {
        canvasRef.current.style.display = "block";
      }
      if (webglAvailable && renderer && scene && camera) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
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
  }, [stage, onComplete, webglAvailable]);

  return (
    <>
      <style>{styles}</style>
      <div className="popup-overlay">
        <div className="popup-box">
          <div className="popup-icon-container">
            {stage === "setup" && webglAvailable && (
              <canvas ref={canvasRef} id="three-canvas-react" />
            )}
            {stage === "setup" && !webglAvailable && (
              <div className="setup-fallback">RS</div>
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
          <h2 id="popup-title">Login Successful!</h2>
          <p id="popup-message">
            {stage === "setup"
              ? "Setting up your environment..."
              : "Redirecting to dashboard..."}
          </p>
        </div>
      </div>
    </>
  );
};

// ======================================================================
// --- MODIFIED: LoginView Component ---
// ======================================================================

export default function LoginView() {
  const theme = useTheme();
  const router = useRouter();

  // --- STATES ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState("password");
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // NEW: State to control the success popup
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // --- HANDLERS ---

  // MODIFIED: This function now triggers the popup instead of a toast
  const handleLoginSuccess = (data) => {
    sessionStorage.setItem("user_id", data.loggedUserId);
    sessionStorage.setItem("user_role", data.loggedUserRole);
    sessionStorage.setItem("user_email", data.loggedUserEmail);
    sessionStorage.setItem("user_image", data.loggedUserImage);
    sessionStorage.setItem("user_name", data.loggedUserName);
    sessionStorage.setItem("rs_token", data.rsToken);
    if (data?.sidebarLinks) {
      sessionStorage.setItem("sidebar_links", JSON.stringify(data.sidebarLinks));
    } else if (data?.sessionData?.sidebarLinks) {
      sessionStorage.setItem(
        "sidebar_links",
        JSON.stringify(data.sessionData.sidebarLinks)
      );
    }

    // Show the popup
    setShowSuccessPopup(true);
  };

  // NEW: Handler to be called when popup sequence is complete
  const handlePopupComplete = () => {
    window.location.href = "/dashboard"; // Redirect to dashboard
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/login/dashboard/user`, {
        email,
        password,
      });
      if (response.status === 200) {
        handleLoginSuccess(response.data);
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 400 || error.response.status === 401)
      ) {
        toast.error(error.response.data.message || "Invalid credentials");
      } else {
        console.error("Login failed:", error);
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const requestOtp = async () => {
    // ... (rest of the function is unchanged)
    if (!email) {
      toast.warn("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/mail/send-otp`, { email });
      if (response.status === 200) {
        toast.success(
          response.data.message || "OTP has been sent to your email.",
        );
        if (!otpSent) setOtpSent(true);
        setResendTimer(30);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Could not send OTP.");
      } else {
        console.error("Send OTP failed:", error);
        toast.error(
          "Failed to send OTP. Please check the email and try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtpSubmit = (e) => {
    e.preventDefault();
    requestOtp();
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.warn("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${localUrl}/mail/verify-otp`, {
        email,
        otp,
      });
      if (response.status === 200) {
        handleLoginSuccess(response.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data.message || "Invalid OTP.");
      } else {
        console.error("OTP verification failed:", error);
        toast.error("OTP verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIC ---

  const renderPasswordForm = (
    <Stack spacing={3} component="form" onSubmit={handlePasswordSubmit}>
      <TextField
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email address"
        required
      />
      <TextField
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? "text" : "password"}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                <Iconify
                  icon={showPassword ? "eva:eye-fill" : "eva:eye-off-fill"}
                />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  const renderOtpForm = (
    <Stack
      spacing={2}
      component="form"
      onSubmit={!otpSent ? handleSendOtpSubmit : handleOtpSubmit}
    >
      <TextField
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        label="Email address"
        required
        disabled={otpSent}
      />
      {otpSent && (
        <>
          <TextField
            name="otp"
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Box sx={{ textAlign: "right", mt: -1, mb: 1 }}>
            {resendTimer > 0 ? (
              <Typography variant="body2" color="text.secondary">
                Resend OTP in {resendTimer}s
              </Typography>
            ) : (
              <Button size="small" onClick={requestOtp} disabled={loading}>
                Resend OTP
              </Button>
            )}
          </Box>
        </>
      )}
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        color="inherit"
        loading={loading}
      >
        {!otpSent ? "Send OTP" : "Verify & Login"}
      </LoadingButton>
    </Stack>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: "/assets/background/overlay_4.jpg",
        }),
        height: 1,
      }}
    >
      {/* NEW: Render the popup when state is true */}
      {showSuccessPopup && (
        <LoginSuccessPopup onComplete={handlePopupComplete} />
      )}

      <Logo
        sx={{
          position: "fixed",
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card sx={{ p: 5, width: 1, maxWidth: 420 }}>
          <Typography variant="h4">Sign in to Roomsstay</Typography>

          <Stack direction="row" spacing={2} sx={{ my: 3 }}>
            <Button
              fullWidth
              variant={loginMethod === "password" ? "contained" : "outlined"}
              onClick={() => setLoginMethod("password")}
            >
              Login with Password
            </Button>
            <Button
              fullWidth
              variant={loginMethod === "otp" ? "contained" : "outlined"}
              onClick={() => setLoginMethod("otp")}
            >
              Login with OTP
            </Button>
          </Stack>

          {loginMethod === "password" ? renderPasswordForm : renderOtpForm}
        </Card>
      </Stack>
    </Box>
  );
}
