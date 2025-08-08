"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  Brain,
  Camera,
  Target,
  Bell,
  Smartphone,
  UserCircle,
  HelpCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { motion } from "framer-motion";

const features = [
  {
    icon: <BarChart2 className="w-8 h-8 text-indigo-600" />,
    title: "Visual Dashboards",
    desc: "Track your spending and savings with beautiful charts.",
    gradient: "from-blue-500 to-purple-600",
    delay: 0.1,
  },
  {
    icon: <Brain className="w-8 h-8 text-indigo-600" />,
    title: "AI Insights & Chatbot",
    desc: "Get smart suggestions and ask finance questions.",
    gradient: "from-purple-500 to-pink-600",
    delay: 0.2,
  },
  {
    icon: <Camera className="w-8 h-8 text-indigo-600" />,
    title: "OCR Bill Scanning",
    desc: "Snap a photo, auto-fill your expenses.",
    gradient: "from-green-500 to-blue-600",
    delay: 0.3,
  },
  {
    icon: <Target className="w-8 h-8 text-indigo-600" />,
    title: "Goal-Based Savings",
    desc: "Set, track, and achieve your savings goals.",
    gradient: "from-orange-500 to-red-600",
    delay: 0.4,
  },
  {
    icon: <Bell className="w-8 h-8 text-indigo-600" />,
    title: "Budget Alerts",
    desc: "Get notified before you overspend.",
    gradient: "from-red-500 to-pink-600",
    delay: 0.5,
  },
  {
    icon: <Smartphone className="w-8 h-8 text-indigo-600" />,
    title: "PWA & Mobile Ready",
    desc: "Use on any device, install as an app.",
    gradient: "from-indigo-500 to-purple-600",
    delay: 0.6,
  },
];

const faqs = [
  {
    q: "Is FinTrack free?",
    a: "Yes! It's free for students and always will be.",
  },
  {
    q: "How does AI help me save?",
    a: "AI analyzes your spending and gives you actionable tips to save more.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Absolutely! It's mobile-friendly and installable as a PWA.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, your data is encrypted and never shared.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -10,
    scale: 1.05,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 20,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { data: session } = useSession();

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="font-sans w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      {/* Hero Section */}
      <section className="w-full h-[calc(100dvh-64px)] md:h-[calc(100vh-64px)] flex flex-col items-center justify-center py-6 md:py-10 px-4 text-center relative overflow-hidden bg-[url('/hero.png')] bg-no-repeat bg-cover bg-center">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/85 backdrop-blur-[1px] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none dark:hidden bg-gradient-to-b from-white/30 via-transparent to-white/30" />
        <div className="relative z-10 mt-0">
          <div className="mx-auto max-w-3xl bg-white/60 dark:bg-zinc-900/30 backdrop-blur-sm rounded-2xl px-6 py-6 shadow-xl border border-white/30 dark:border-white/10">
            <motion.h1
              className="flex items-center justify-center gap-3 text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-3 sm:mb-4 md:mb-6"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex rounded ">
                <Image
                  src="/logo.png"
                  alt="FinTrack Logo"
                  width={90}
                  height={90}
                  className="rounded"
                  priority
                />
              </span>
              FinTrack
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-zinc-700 dark:text-zinc-200 max-w-xl sm:max-w-2xl md:max-w-3xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              The smartest, AI-powered expense manager for students. Track,
              analyze, and save smarter—on any device.
            </motion.p>

            {session ? (
              <motion.div
                className="space-y-4 sm:space-y-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.p
                  className="text-lg sm:text-lg text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Welcome back,{" "}
                  <span className="text-green-600 text-lg">
                    {session.user?.name}!
                  </span>
                </motion.p>
                <Link href="/dashboard">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-700 text-white font-bold shadow-xl">
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={handleGoogleSignIn}
                    className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-xl"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Sign in with Google
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto py-30 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 pb-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Amazing Features
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto">
            Everything you need to take control of your finances
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover="hover"
              className="group relative"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl`}
                animate="animate"
                variants={floatingVariants}
              />
              <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-zinc-800 hover:shadow-3xl transition-all duration-300 min-h-[280px] flex flex-col justify-center">
                <motion.div
                  className="mb-6 flex justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl">
                    {feature.icon}
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold mb-4 text-center text-indigo-700 dark:text-indigo-300">
                  {feature.title}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-center leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-6xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            How It Works
          </h2>
        </motion.div>

        <motion.div
          className="flex flex-col md:flex-row gap-12 items-center justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {[
            {
              icon: <UserCircle className="w-10 h-10 text-indigo-600" />,
              title: "Sign in with Google",
              desc: "Quick, secure, and no passwords to remember.",
            },
            {
              icon: <BarChart2 className="w-10 h-10 text-indigo-600" />,
              title: "Track & Analyze",
              desc: "Log expenses, set goals, and see your progress in real time.",
            },
            {
              icon: <Brain className="w-10 h-10 text-indigo-600" />,
              title: "Get AI Insights",
              desc: "Let AI help you save and budget smarter.",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-6 text-center max-w-sm"
              initial={{ opacity: 0, y: 100, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              animate={{
                x: [0, 40, 0, -40, 0],
                y: [0, -40, 0, 40, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut" as const,
                delay: index * 2.5,
              }}
              whileHover={{
                scale: 1.05,
                y: -10,
                transition: {
                  type: "spring" as const,
                  stiffness: 300,
                  damping: 20,
                },
              }}
            >
              <motion.div
                className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full shadow-lg"
                whileHover={{
                  scale: 1.1,
                  rotate: 10,
                  boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
                  transition: {
                    type: "spring" as const,
                    stiffness: 400,
                    damping: 15,
                  },
                }}
              >
                {step.icon}
              </motion.div>
              <motion.h3
                className="text-2xl font-bold text-indigo-700 dark:text-indigo-300"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(99, 102, 241, 0.3)",
                    "0 0 20px rgba(99, 102, 241, 0.6)",
                    "0 0 10px rgba(99, 102, 241, 0.3)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut" as const,
                  delay: index * 0.2,
                }}
              >
                {step.title}
              </motion.h3>
              <motion.p
                className="text-zinc-600 dark:text-zinc-300 text-base leading-relaxed"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.3,
                }}
              >
                {step.desc}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-4xl mx-auto py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            FAQ&apos;S
          </h2>
        </motion.div>

        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-zinc-800"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            >
              <button
                className="flex items-center justify-between w-full text-left"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-lg text-indigo-700 dark:text-indigo-200">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openFaq === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <HelpCircle className="w-6 h-6 text-indigo-600" />
                </motion.div>
              </button>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openFaq === i ? "auto" : 0,
                  opacity: openFaq === i ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 text-zinc-600 dark:text-zinc-300 text-sm pt-2 border-t border-gray-100 dark:border-zinc-800">
                  {faq.a}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="w-full py-20 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-black/10"
          animate={{
            background: [
              "rgba(0,0,0,0.1)",
              "rgba(0,0,0,0.05)",
              "rgba(0,0,0,0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />

        <motion.div
          className="relative max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold text-white mb-6">
            Ready to take control of your finances?
          </h2>
          {session ? (
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="text-lg px-10 py-6 bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-2xl">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </Link>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleGoogleSignIn}
                className="text-lg px-10 py-6 bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-2xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Get Started with Google
              </Button>
            </motion.div>
          )}
        </motion.div>
      </section>
    </div>
  );
}
