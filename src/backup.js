const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

function firestoreDocumentUrl(id) {
  const database = encodeURIComponent("(default)");
  const project = encodeURIComponent(firebaseConfig.projectId);
  const docId = encodeURIComponent(id);
  return `https://firestore.googleapis.com/v1/projects/${project}/databases/${database}/documents/luzcontrol_backups/${docId}?key=${firebaseConfig.apiKey}`;
}

async function backupIdFromCode(code) {
  const normalized = code.trim().toLowerCase();
  const bytes = new TextEncoder().encode(`luzcontrol:${normalized}`);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

function sanitizeForBackup(appData) {
  return {
    ...appData,
    configuracoes: {
      ...appData.configuracoes,
      backup: {
        enabled: Boolean(appData.configuracoes?.backup?.enabled),
      },
    },
  };
}

export function isBackupAvailable() {
  return hasFirebaseConfig;
}

export async function saveRemoteBackup(appData, code) {
  if (!hasFirebaseConfig) throw new Error("Firebase nao configurado.");
  if (!code?.trim()) throw new Error("Codigo de backup vazio.");

  const id = await backupIdFromCode(code);
  const response = await fetch(firestoreDocumentUrl(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        app: { stringValue: "LuzControl" },
        version: { integerValue: "1" },
        updatedAt: { timestampValue: new Date().toISOString() },
        payloadJson: { stringValue: JSON.stringify(sanitizeForBackup(appData)) },
      },
    }),
  });

  if (!response.ok) throw new Error("Falha ao salvar backup.");
}

export async function loadRemoteBackup(code) {
  if (!hasFirebaseConfig) throw new Error("Firebase nao configurado.");
  if (!code?.trim()) throw new Error("Codigo de backup vazio.");

  const id = await backupIdFromCode(code);
  const response = await fetch(firestoreDocumentUrl(id));

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Falha ao carregar backup.");

  const data = await response.json();
  const payloadJson = data?.fields?.payloadJson?.stringValue;
  return payloadJson ? JSON.parse(payloadJson) : null;
}
