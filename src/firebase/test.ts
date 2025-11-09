import { db } from "./config";
import { collection, addDoc } from "firebase/firestore";

async function addTestOrder() {
  try {
    const docRef = await addDoc(collection(db, "orders"), {
      menu: "Margherita Pizza",
      quantity: 1,
      createdAt: new Date(),
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

addTestOrder();
