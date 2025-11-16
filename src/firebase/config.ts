// Firebase SDK の必要な関数だけをインポート
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Web アプリの設定情報（環境変数から読み込み）
// Minima_Adminと同じFirebaseプロジェクト（minima-admin）を使用
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAgeHreGY29lH8uri73GTaFa9UOdv3xTig",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "minima-admin.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "minima-admin",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "minima-admin.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "896370773667",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:896370773667:web:85c502b5939b3e7a06b916"
};

// Firebase アプリを初期化（既に初期化されている場合は再利用）
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firestore インスタンスを作成
const db = getFirestore(app);

// Storage インスタンスを作成
const storage = getStorage(app);

// エクスポート
export { app, db, storage };
