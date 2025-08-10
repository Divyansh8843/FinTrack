# FinTrack - AI-Powered Expense Tracker

A smart, AI-powered expense management application built with Next.js, designed specifically for students to track, analyze, and optimize their spending.

![Tech](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38b2ac?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![Node](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)

## Features

- 🎯 **Smart Expense Tracking** - Log and categorize expenses with ease
- 🤖 **AI-Powered Insights** - Get personalized financial advice and spending analysis
- 📊 **Visual Dashboards** - Beautiful charts and analytics for your finances
- 📱 **Mobile-First Design** - Responsive PWA that works on all devices
- 🔐 **Secure Authentication** - Google OAuth integration
- 📸 **OCR Bill Scanning** - Automatically extract expense data from receipts
- 🎯 **Goal-Based Savings** - Set and track financial goals
- 🔔 **Smart Notifications** - Budget alerts and spending reminders

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **AI**: OpenAI GPT-4, Google Cloud Vision API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x
- MongoDB database
- Google OAuth credentials
- OpenAI API key (optional)
- Google Cloud Vision API key (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd FunTrack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string

   # Authentication
   NEXTAUTH_SECRET=your_nextauth_secret_key
   NEXTAUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # AI Services (Optional)
   OPENROUTER_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key
   GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key

   # Email (Optional)
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_username
   SMTP_PASS=your_smtp_password
   MAIL_FROM=noreply@yourdomain.com
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Build**: `npm run build`

## Quick Start

1. Clone and install
   - `git clone <your-repo-url>`
   - `cd FunTrack && npm ci`
2. Create `.env.local` with values (see sample below)
3. Run the app: `npm run dev` → http://localhost:3000

### .env.local sample
```
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Services (Optional)
OPENROUTER_API_KEY=your_openai_api_key
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_SITE_URL=http://localhost:3000
OPENROUTER_APP_NAME=FinTrack Dev
GEMINI_API_KEY=your_gemini_api_key

# OCR (Optional)
GOOGLE_CLOUD_VISION_API_KEY=your_vision_api_key

# Email (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM=noreply@yourdomain.com
```

## Scripts

- **dev**: start Next.js in development mode
- **build**: create an optimized production build
- **start**: run the production server
- **lint**: run ESLint with Next.js config
- **type-check**: run TypeScript in noEmit mode

## Deployment on Vercel

### 1. **Connect to Vercel**

- Push your code to GitHub
- Connect your repository to Vercel
- Vercel will automatically detect Next.js

### 2. **Set Environment Variables**

In your Vercel project settings, add all the environment variables from your `.env.local` file.

### 3. **Deploy**

- Vercel will automatically build and deploy on every push to main branch
- Or manually trigger deployments from the Vercel dashboard

Notes:
- Uses Node 20.x as defined in `package.json` `engines`
- Build command: `npm run build`
- Output directory: `.next`
- Framework: Next.js (App Router)

### 4. **Custom Domain (Optional)**

- Add your custom domain in Vercel project settings
- Update `NEXTAUTH_URL` to match your domain

## Troubleshooting

- **Build fails due to MONGODB_URI**: Ensure `MONGODB_URI` is set in Vercel. The code validates at connection time, not at build.
- **NextAuth callback errors**: Verify `NEXTAUTH_URL` matches the deployed domain and Google OAuth redirect URLs are configured accordingly.
- **Images not loading**: Confirm your remote domains in `next.config.js` `images.domains`/`remotePatterns`.
- **AI/OCR not working**: Check related API keys and quotas. Features are optional.

## Security & Secrets

- Do not commit `.env*` files. Use Vercel environment variables for Production/Preview.
- Rotate credentials periodically. Scope API keys to least privilege.
- Emails are sent via SMTP settings you provide; prefer provider-specific app passwords.

## Performance & SEO

- HTTP headers and compression configured in `next.config.js`.
- Image optimization configured with `remotePatterns`, formats `webp/avif`.
- Cache policy for static images set via headers in `vercel.json` and `next.config.js`.

## FAQ

- **Can I run without AI keys?** Yes, AI features are optional; core tracking works without them.
- **Which Node version is required?** Node 20.x (as per `package.json` `engines`).
- **Which database is supported?** MongoDB via Mongoose.

## Environment Variables Reference

| Variable                      | Required | Description                         |
| ----------------------------- | -------- | ----------------------------------- |
| `MONGODB_URI`                 | ✅       | MongoDB connection string           |
| `NEXTAUTH_SECRET`             | ✅       | Secret key for NextAuth.js          |
| `NEXTAUTH_URL`                | ✅       | Your application URL                |
| `GOOGLE_CLIENT_ID`            | ✅       | Google OAuth client ID              |
| `GOOGLE_CLIENT_SECRET`        | ✅       | Google OAuth client secret          |
| `OPENROUTER_API_KEY`          | ❌       | OpenAI API key for AI features      |
| `GEMINI_API_KEY`              | ❌       | Google Gemini API key               |
| `GOOGLE_CLOUD_VISION_API_KEY` | ❌       | Google Cloud Vision API key         |
| `SMTP_HOST`                   | ❌       | SMTP server for email notifications |
| `SMTP_PORT`                   | ❌       | SMTP port (default: 587)            |
| `SMTP_USER`                   | ❌       | SMTP username                       |
| `SMTP_PASS`                   | ❌       | SMTP password                       |
| `MAIL_FROM`                   | ❌       | From email address                  |

## Project Structure

```
FunTrack/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── add-expense/       # Add expense page
│   └── ...                # Other pages
├── components/            # Reusable components
├── lib/                   # Utility functions
├── models/                # MongoDB models
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact the development team.
