# Render Environment Variables Setup

## Required Environment Variables for Render Deployment

Make sure these environment variables are set in your Render dashboard:

### Firebase Admin SDK Variables:
```
TYPE=service_account
PROJECT_ID=material-web-app-5af17
PRIVATE_KEY_ID=0ad2aafe52ebac7a7b55dc04ed19d21e33d7e0f3
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCR64Mlq4hPc2+X
5TmGDgGPWFJSjg++tV8bo9RlmtPWFn+fxeIHaFphTe4LXrhcz1Vc6aSIyVJIWW/v
cJg8LcYQ65iXora5chriu4gxgnQl6lELvZys/Yq/GUf9faMyGJRY39HLloloCtbq
YaU9D4Y15+IRt2+DXNPU8qyu/uCy8lsE0Gsc6zRkfwEH/PG1iitzT8wZwrtAklPK
g8aFF0jB+yf7YysEkjOFTvI+jGFWiOiujR3xa2mUWSMzzevUG5W9Dzk3oRSv5ftl
VIwrICaihT3h5S/n6l1j9eqC8AcLM/sy8x7g/CkN5NsYtHvmALT2MXkWtEu1ET3N
kV/UsS1PAgMBAAECggEAMokXBW/PqHx5FGj9sBCft65F7HNovop/4smtYHbrkISA
NKxKqHgafQKJQ4TNYs8naCM+qWTXy1i2LH2ZK5ZKt0dwtGtUzwrWhtmdxE/Cu/LX
mLJVVZAFgkNWLFNbtpjOn6z8Mn7zHYZLgibJHEmJGJgzMiGOTDdU4bYd2glJdo90
uuTPBfJwtiimk1r56jCVBRkNvK5q7yhqEh3MzPmiLRGhNa4rShWxw7x72X/M+Txf
/8ffpjBKsg90Cg1Qs9Bu74sVKL6XmA+XyQ4wyZCuhhiZM8Bfewy+uekIeFUJRSso
/9j9UXyhf6nO8MkTXX1V+5EoijgI337ufTzFljXpqQKBgQDJfPXK5MwigIGlmLDl
dn0aCYoVkX1KQZinBAZvXeu+BylrleJvtv0+Iv7IQn6kZRS6JgSMoLo9mccku8Kt
NHbfWc8ihuux9ccdvRwqzX3u9wK35aPUqBbHE0twr+RhaVg5XXTXf6hj4ova60Ly
yivIRJWvrC/YeQS60yAwmBwflQKBgQC5ZejLEixqtMWHbEG8WueV4KzJyeEs2lku
33Z71b3uP3lck+OjQ7xHZnYFZUeVNO6rWGJ+/1Nr/ptDphS14vSAykAL/+yGZS0X
Jnd0VBvfO8/zVOEfBp3j6ErkpNdFjiNJbietNo7IPsREx/dH0cElqkxTKZyEvrIt
mBvQyUswUwKBgF24dkwN6LYTuDpir8XMO5yk20n1BqZHpM3rHWMn+MPHaQjWCyGT
qHACryhPZcDqE54SmQMgsAB/SxZXD9KpGLIDgEm7IF8Cx7+Ze0SdmPpSgz0u3+nG
1fF7lBeyeTSmX5cvVW33v0fW1N7bl6R/TaY14Lp6CTdT81NDaTGxT0ORAoGASGCp
lgWdQ3cZGjpAG3ldqZxRuGFQwALqCCuDBOs3v7gV9/dgSg+ahEFS195nKK/GcSwL
H8sr1SBLmwhOU4errk/G2yhpPTpodP42ajqfuvGNyFAdptAdeajo/AQCaowH6JXR
dYS0Dya51qQ+PFJ91ed67ohzKzuLMdONIGBFMzMCgYBkC6+Y9+wDH+emZjX1FYNB
IeNV6rJXgc2F/llzaQRIR49TXnsgLJgTJEXTxH9HO/rR6DVawdJFfCwGMb7l+Hj4
ceUTm5IeYevZEy89I9B3dY69dsyb+H5eEGt/XXqIIVhJwdU2myUzgLc9bM+StBts
q0F0z3iYJ/+c8iL5qJFaBg==
-----END PRIVATE KEY-----
CLIENT_EMAIL=firebase-adminsdk-1uvt6@material-web-app-5af17.iam.gserviceaccount.com
CLIENT_ID=117337414848488196725
AUTH_URI=https://accounts.google.com/o/oauth2/auth
TOKEN_URI=https://oauth2.googleapis.com/token
AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-1uvt6%40material-web-app-5af17.iam.gserviceaccount.com
UNIVERSE_DOMAIN=googleapis.com
```

### Google Drive Configuration:
```
GOOGLE_DRIVE_FOLDER_ID=1FX1V0TO_cXrwE1RNRhiVUy49JmNNo20c
```

### Port Configuration:
```
PORT=10000
```

## Steps to Update Render:

1. Go to your Render dashboard
2. Open your web service
3. Go to Environment tab
4. Add/update all the environment variables listed above
5. Click "Save Changes"
6. Wait for the automatic redeploy

## Troubleshooting:

1. **Check Health Endpoint**: Visit `https://getmaterial-fq27.onrender.com/health` to verify server status
2. **Check Logs**: Monitor the Render logs for any startup errors
3. **Test Authentication**: Use the `/test-auth` endpoint to verify Firebase token validation

## Important Notes:

- Make sure the `PRIVATE_KEY` value includes the full key with `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Ensure no extra spaces or newlines in environment variable values
- The server will show initialization status in the logs on startup
