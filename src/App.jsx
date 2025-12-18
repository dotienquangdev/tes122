import React from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, signInWithGoogle, signInWithGoogleRedirect } from "./firebase";
import { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [route, setRoute] = useState("/login");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const idToken = await u.getIdToken();
        setToken(idToken);
        setRoute("/home");
      } else {
        setToken("");
        setRoute("/login");
      }
    });
    return () => unsub();
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Login error:", err);
      const code = err && err.code ? err.code : "";
      if (code === "auth/popup-blocked" || code === "auth/pop-up-blocked") {
        alert(
          "Popup bị chặn — bỏ chặn popup hoặc dùng chuyển hướng. Thử redirect..."
        );
        try {
          await signInWithGoogleRedirect();
        } catch (rErr) {
          console.error("Redirect sign-in error:", rErr);
          alert(
            "Đăng nhập thất bại bằng redirect: " +
              (rErr && rErr.message ? rErr.message : rErr)
          );
        }
        return;
      }
      if (code === "auth/popup-closed-by-user") {
        return;
      }
      alert("Đăng nhập thất bại: " + (err && err.message ? err.message : err));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setRoute("/login");
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  const LoginView = (
    <div className="card">
      <div className="header">
        <div>
          <h1 className="title">MindX Web App Login</h1>
          <p className="subtitle">
            Nhấn nút để chọn tài khoản Google trên máy bạn.
          </p>
        </div>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={login} className="btn primary">
          Login with Google
        </button>
      </div>
    </div>
  );

  const HomeView = (
    <div className="card">
      <div className="header">
        <div>
          <h1 className="title">MindX Web App Home</h1>
        </div>
        <div>
          <button onClick={logout} className="btn ghost">
            Logout
          </button>
        </div>
      </div>

      {user && (
        <div className="user-info">
          <p>
            Đăng nhập bằng: <b>{user.email}</b>
          </p>
          <p>Tên: {user.displayName || "(không có)"}</p>
        </div>
      )}

      <p className="jwt">JWT: {token}</p>
    </div>
  );

  return (
    <div className="app-container">
      {route === "/home" ? HomeView : LoginView}
    </div>
  );
}

export default App;
