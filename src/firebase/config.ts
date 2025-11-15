// Firebase SDK の必要な関数だけをインポート
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase Web アプリの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyCvf105GRYSmFGH3d_p2uO82j8vfyM2wQE",
  authDomain: "minima-order.firebaseapp.com",
  projectId: "minima-order",
  storageBucket: "minima-order.appspot.com",
  messagingSenderId: "282961633565",
  appId: "1:282961633565:web:4ce36c89b64352e9c201f4"
};

// Firebase アプリを初期化
const app = initializeApp(firebaseConfig);

// Firestore インスタンスを作成
const db = getFirestore(app);

// Storage インスタンスを作成
const storage = getStorage(app);

// エクスポート
export { app, db, storage };
