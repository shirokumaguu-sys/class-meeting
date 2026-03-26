// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// ★あなたの設定（そのまま使用）
const firebaseConfig = {
  apiKey: "AIzaSyClb-PEpIXkhE2ytEsql0pIvAVyNUC_T-I",
  authDomain: "class-meeting-2-2.firebaseapp.com",
  projectId: "class-meeting-2-2",
  storageBucket: "class-meeting-2-2.firebasestorage.app",
  messagingSenderId: "43109933184",
  appId: "1:43109933184:web:d16e2240b21204fb000665",
  measurementId: "G-12CKG1SK3Z"
};

// 初期化
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
