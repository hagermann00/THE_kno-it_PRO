# Kno-It API Key Retrieval (Fast-Path)

**PREREQUISITE:** Use the browser where you are ALREADY logged in as `hagermann00`.

---

## 🔹 OPTION 1: Gemini (Google) - "Hagermann00" Profile
**Target:** Retrieve existing key or create new one on `hagermann00` account.

1.  **Open Link**: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2.  **Check Identity**: Look at the top-right corner.
    *   **IF** it shows `hagermann00`: Proceed.
    *   **IF** it shows another user: Click icon -> Switch to `hagermann00`.
    *   **OBSTACLE ALERT**: If Google asks to "Verify it's you" or do 2FA, complete it on your phone immediately.
3.  **Get Key**:
    *   *Scenario A (Key Exists)*: Look for a row in the list. Click the **Key** icon to copy.
    *   *Scenario B (No Key)*: Click **"Create API Key"** -> **"Create in new project"**.
4.  **Copy Key**: String starts with `AIza`.
5.  **Action**: Paste into `.env` at `GEMINI_API_KEY=`.

---

## 🔹 OPTION 2: Groq (Llama 3)
**Target:** Retrieve Groq Key (likely using your Google login).

1.  **Open Link**: [https://console.groq.com/keys](https://console.groq.com/keys)
2.  **Obstacle Check**:
    *   **IF** Login screen appears: Click **"Continue with Google"** -> Select `hagermann00`.
3.  **Get Key**:
    *   Click **"Create API Key"**.
    *   Name: `KnoIt`.
    *   Click **"Submit"**.
4.  **Copy Key**: String starts with `gsk_`.
5.  **Action**: Paste into `.env` at `GROQ_API_KEY=`.

---

## 🚨 TROUBLESHOOTING / FAIL-SAFE
**If ANY login fails or gets blocked:**

*   **Plan B (Gemini)**: Use *any* other Google account you are logged into. The Free Tier is available on *all* personal Google accounts. Just get a key from *somewhere*.
*   **Plan C (Skip)**: If you cannot get a key right now, type `npm run demo` and we will use the **Mock Simulator** (it works automatically if no keys are found).

---

## ✅ CONFIRMATION
Once pasted into `c:\Y-OS\Y-IT_ENGINES\kno-it\.env`, save the file.
Then run:
`npm run demo "research test"`
