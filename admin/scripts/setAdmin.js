import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();

async function setAdmin() {
  try {
    const user = await auth.getUserByEmail(
      'whatif.administrativo@gmail.com'
    );

    await auth.setCustomUserClaims(user.uid, {
      admin: true,
    });

    console.log('Permissão de administradora concedida!');
    console.log('UID:', user.uid);
  } catch (error) {
    console.error('Erro ao conceder permissão:', error);
    process.exitCode = 1;
  }
}

setAdmin();