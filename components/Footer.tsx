"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook,
  FaTwitter,
  FaYoutube,
  FaInstagram,
  FaTiktok,
  FaApple,
  FaAndroid,
  FaLinkedin,
  FaGithub,
  FaVoicemail,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-zinc-900 border-t shadow-t-lg py-6 px-4 md:px-12 flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex flex-col gap-2 min-w-[180px]">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src="/logo.png"
              alt="FinTrack Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold text-2xl text-indigo-700 dark:text-indigo-300">
              FinTrack
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1">
          <div className="flex flex-col gap-1">
            <span className="font-bold text-zinc-600  dark:text-zinc-200">
              FinTrack
            </span>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/profile" className="hover:underline">
              Profile
            </Link>
            <Link href="/reports" className="hover:underline">
              Reports
            </Link>
            <Link href="/goals" className="hover:underline">
              Goals
            </Link>
          </div>

          <div className="flex flex-col gap-1">
            <span className="font-bold text-zinc-600 dark:text-zinc-200">
              Information
            </span>
            <Link href="/" className="hover:underline">
              Help
            </Link>
            <Link href="/" className="hover:underline">
              Guidelines
            </Link>
            <Link href="/" className="hover:underline">
              Terms of Use
            </Link>
            <Link href="/" className="hover:underline">
              Privacy Policy
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-zinc-600 dark:text-zinc-200">
              Resources
            </span>
            <Link href="https://nextjs.org/docs" className="hover:underline">
              Next.Js Docs
            </Link>
            <Link
              href="https://tailwindcss.com/docs/installation/using-vite"
              className="hover:underline"
            >
              TailwindCss Docs
            </Link>
            <Link
              href="https://ai.google.dev/gemini-api/docs"
              className="hover:underline"
            >
              Gemini API Docs
            </Link>
            <Link href="https://nodemailer.com" className="hover:underline">
              NodeMailer Docs
            </Link>
            <Link
              href="https://motion.dev/docs/react"
              className="hover:underline"
            >
              FramerMotion Docs
            </Link>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-bold text-zinc-600 dark:text-zinc-200">
              Work With Us
            </span>
            <Link
              href="https://github.com/Divyansh8843/FinTrack"
              className="hover:underline"
            >
              Github Repository
            </Link>
            <Link href="/" className="hover:underline">
              Careers
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="https://www.linkedin.com/in/divyansh-agrawal-4556a0299">
            <FaLinkedin className="w-5 h-5 text-zinc-700 dark:text-zinc-200 cursor-pointer" />
          </Link>
          <Link href="https://github.com/Divyansh8843">
            <FaGithub className="w-5 h-5 text-zinc-700 dark:text-zinc-200 cursor-pointer" />
          </Link>
          <Link href="https://x.com/Ag15277Divyansh">
            <FaTwitter className="w-5 h-5 text-zinc-700 dark:text-zinc-200 cursor-pointer" />
          </Link>
          <Link href="https://www.instagram.com/divy881723">
            <FaInstagram className="w-5 h-5 text-zinc-700 dark:text-zinc-200 cursor-pointer" />
          </Link>
        </div>
        <select className="border rounded px-2 py-1 text-sm bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200">
          <option>India</option>
          <option>USA</option>
          <option>UK</option>
          <option>Canada</option>
        </select>
      </div>
      <div className="flex items-center justify-center gap-2 border-t pt-4">
        <p className="text-base text-center text-zinc-400">
          &copy; {new Date().getFullYear()} FinTrack. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
