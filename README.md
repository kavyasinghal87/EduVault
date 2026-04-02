# 📚 EduVault

**Your Premium Knowledge Vault** — A modern study platform to organize, review, and master your learning materials.

🔗 **Live Demo:** [https://eduvault-eta.vercel.app](https://eduvault-eta.vercel.app)

## What is EduVault?

EduVault is a web-based study tool that lets you create **vaults** (knowledge bases), organize them into **collections**, and build **study sets** with flashcards. Then use interactive study modes like flashcard review, match games, and learn mode to retain what you've learned.

## Features

- 🗂️ **Vaults & Collections** — Organize study materials into structured knowledge bases
- 🃏 **Flashcards** — Create and review flashcards with spaced repetition (SM-2 algorithm)
- 🎮 **Match Game** — Timed term-definition matching for active recall
- 📝 **Learn Mode** — Multiple-choice quizzes to test your knowledge
- 📊 **Dashboard** — Track your progress with stats, streaks, and recent activity
- 🔐 **Auth** — Secure login and signup powered by Supabase

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database & Auth | Supabase |
| State Management | Zustand |
| Animations | Framer Motion |
| Icons | Lucide React |

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** — Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. **Run the dev server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Pages and layouts (Next.js App Router)
│   ├── (auth)/       # Login and signup pages
│   └── (dashboard)/  # Protected dashboard pages
├── components/       # Reusable UI components
├── lib/              # Supabase clients and utilities
└── stores/           # Zustand state management
```

## License

This project is for educational purposes.
