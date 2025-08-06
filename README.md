# SkillSync App 📚

A modern React Native learning tracker app built with Expo, featuring skill management, progress tracking, analytics, and beautiful UI/UX.

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, make sure you have the following installed:

#### **Required Software:**
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **VS Code** - [Download here](https://code.visualstudio.com/)

#### **For Mobile Development:**
- **Expo CLI** (will be installed automatically)
- **Expo Go app** on your phone (for testing)

---

## 📋 Step-by-Step Setup Instructions

### **Step 1: Clone the Repository**

1. **Open VS Code**
2. **Open Terminal in VS Code:**
   - Press `Ctrl + Shift + `` (backtick) or
   - Go to `Terminal` → `New Terminal`

3. **Navigate to your desired folder:**
   ```bash
   cd C:\Users\YourUsername\Desktop
   ```

4. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/SkillSyncApp.git
   ```

5. **Navigate to the project folder:**
   ```bash
   cd SkillSyncApp
   ```

### **Step 2: Install Dependencies**

1. **In the VS Code terminal, run:**
   ```bash
   npm install
   ```

2. **Wait for installation to complete** (this may take a few minutes)

3. **Verify installation:**
   ```bash
   npm --version
   npx expo --version
   ```

### **Step 3: Set Up Your Development Environment**

#### **Option A: Web Development (Easiest for Beginners)**

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Press `w`** in the terminal to open in web browser

3. **Your app will open in your default browser** at `http://localhost:8081`

#### **Option B: Mobile Development (Recommended)**

1. **Install Expo Go on your phone:**
   - **Android:** Search "Expo Go" in Google Play Store
   - **iOS:** Search "Expo Go" in App Store

2. **Start the development server:**
   ```bash
   npx expo start
   ```

3. **Connect your phone:**
   - **Same WiFi:** Scan the QR code with Expo Go app
   - **Different WiFi:** Use tunnel mode (press `t` in terminal)

---

## 🔧 Advanced Setup

### **Database Setup (Supabase)**

The app uses Supabase for data storage. To set up your own database:

1. **Create a Supabase account** at [supabase.com](https://supabase.com)

2. **Create a new project**

3. **Run the database schema:**
   - Copy the contents of `database-schema.sql`
   - Paste into Supabase SQL editor
   - Click "Run"

4. **Get your credentials:**
   - Go to Settings → API
   - Copy your `URL` and `anon key`

5. **Update environment variables:**
   - Create a `.env` file in the root directory
   - Add your Supabase credentials

### **VS Code Extensions (Recommended)**

Install these VS Code extensions for better development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **Auto Rename Tag**
5. **Bracket Pair Colorizer**

**To install extensions:**
1. Press `Ctrl + Shift + X`
2. Search for each extension
3. Click "Install"

---

## 🎯 Running the App

### **Development Mode**

1. **Start the development server:**
   ```bash
   npx expo start
   ```

2. **Choose your platform:**
   - Press `w` for web
   - Press `a` for Android (requires Android Studio)
   - Press `i` for iOS (requires Xcode, Mac only)
   - Scan QR code with Expo Go app

### **Common Commands**

```bash
# Start development server
npx expo start

# Start with tunnel (for different WiFi networks)
npx expo start --tunnel

# Clear cache and restart
npx expo start --clear

# Build for production
npx expo build

# Run linting
npx eslint .

# Run TypeScript check
npx tsc --noEmit
```

---

## 📱 App Features

### **Core Functionality:**
- ✅ **Skill Management** - Add, edit, and track learning skills
- ✅ **Progress Tracking** - Log hours and track progress
- ✅ **Analytics Dashboard** - Beautiful charts and insights
- ✅ **Streak System** - Maintain learning momentum
- ✅ **Modern UI/UX** - Material Design with animations
- ✅ **Cross-Platform** - Works on iOS, Android, and Web

### **Technical Stack:**
- **React Native** with Expo
- **TypeScript** for type safety
- **Supabase** for backend
- **Expo Router** for navigation
- **React Native Animated** for smooth animations

---

## 🛠️ Troubleshooting

### **Common Issues & Solutions:**

#### **"Command not found" errors:**
```bash
# Reinstall Node.js and npm
# Clear npm cache
npm cache clean --force
```

#### **"Metro bundler" errors:**
```bash
# Clear Expo cache
npx expo start --clear
```

#### **"Cannot resolve module" errors:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### **"Expo Go connection" issues:**
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`
- Check firewall settings

#### **"TypeScript errors":**
```bash
# Check TypeScript
npx tsc --noEmit

# Fix linting issues
npx eslint . --fix
```

### **Getting Help:**

1. **Check the terminal output** for error messages
2. **Google the error message** - most issues have solutions online
3. **Check Expo documentation** at [docs.expo.dev](https://docs.expo.dev)
4. **Ask in the community** - Discord, Stack Overflow, or GitHub Issues

---

## 📁 Project Structure

```
SkillSyncApp/
├── app/                    # Main app screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab screens
│   └── skill/             # Skill detail screens
├── components/             # Reusable components
├── context/               # React Context providers
├── constants/             # App constants and colors
├── hooks/                 # Custom React hooks
├── services/              # API services
├── utils/                 # Utility functions
└── assets/                # Images and fonts
```

---

## 🎨 Customization

### **Theming:**
- Edit `constants/Colors.ts` to change app colors
- Modify `components/UniformLayout.tsx` for layout changes

### **Adding Features:**
- New screens go in `app/` directory
- Components go in `components/` directory
- API calls go in `services/` directory

---

## 🚀 Deployment

### **For Production:**

1. **Build the app:**
   ```bash
   npx expo build
   ```

2. **Deploy to app stores:**
   - Follow Expo's deployment guide
   - Submit to Apple App Store and Google Play Store

---

## 📚 Learning Resources

### **For Beginners:**
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### **For Advanced Users:**
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo SDK Reference](https://docs.expo.dev/versions/latest/)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Need Help?

- **Documentation:** Check the links above
- **Community:** Join our Discord server
- **Issues:** Report bugs on GitHub
- **Questions:** Ask in the community forums

---

**Happy coding! 🎉**

*Made with ❤️ using React Native and Expo*
