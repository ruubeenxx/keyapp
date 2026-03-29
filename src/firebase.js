import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: "AIzaSyAGWkPu38LsBd1lRZPqkaLtfMDwEHWhfkQ",
  authDomain: "keyapp-bc368.firebaseapp.com",
  projectId: "keyapp-bc368",
  storageBucket: "keyapp-bc368.firebasestorage.app",
  messagingSenderId: "591365328111",
  appId: "1:591365328111:web:8c1f641cf94196cb76df1a"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Messaging solo si el browser lo soporta
export const getMessagingInstance = async () => {
  const supported = await isSupported()
  if (supported) return getMessaging(app)
  return null
}