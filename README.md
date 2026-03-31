## Getting Started

### Prerequisites

- **Node.js 18+** — if you don't have it, install it here: https://nodejs.org/en
- **Expo Go** mobile app — available on App Store or Google Play for testing on a real device
- **Android Studio** *(optional)* — only needed if you want to run an Android Emulator instead of a real device

---

### Install & Run

You can get the project either by cloning it from GitHub or by opening the folder shared in MS Teams.

**Option 1 — Clone from GitHub:**
Create blank folder on your computer and then run

> ⚠️ Make sure you run cd pmnis_vaib two times

```bash
git clone https://github.com/annaskosar/pmnis_vaib.git
cd pmnis_vaib
cd pmis_vaib
```

**Option 2 — Open from MS Teams shared folder:**

Unzip the project folder and navigate into it in your terminal.

---

Once you have the project folder ready, install dependencies and start the development server:
```bash
npm install
npx expo start
```

Then choose how to open the app:

- **Expo Go (real device)** — scan the QR code shown in the terminal with your phone camera (iOS) or the Expo Go app (Android)
- **Android Emulator** — press `a` in the terminal after the server starts (requires Android Studio with a virtual device set up)

> ⚠️ Make sure your phone and computer are connected to the **same Wi-Fi network or hotspot** when using Expo Go.

---

### Testing Notes

- **Outfit Builder — graceful failure:** A simulated error will appear after the **4th outfit regeneration**. This is intentional and tests the error state flow. After dismissing it, the counter resets.