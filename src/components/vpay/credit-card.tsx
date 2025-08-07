"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldCheck, CreditCardIcon , BadgeCheck } from "lucide-react"

interface CreditCardProps {
  balance: number
  type: string
  totalBalance: number
}

export default function CreditCard({ balance, type, totalBalance }: CreditCardProps) {
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [prevBalance, setPrevBalance] = useState(balance)
  const [isIncreasing, setIsIncreasing] = useState(true)

  useEffect(() => {
    setIsIncreasing(balance >= prevBalance)
    setPrevBalance(balance)
  }, [balance, prevBalance])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 15
    const rotateY = (centerX - x) / 15

    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseEnter = () => setIsHovered(true)
  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-200 rounded-full filter blur-3xl opacity-30 animate-pulse"></div>
      <div
        className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-200 rounded-full filter blur-3xl opacity-30 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <motion.div
        className="w-full max-w-lg mx-auto perspective-1000"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          className="relative w-full h-64 rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)",
            transformStyle: "preserve-3d",
          }}
          animate={{
            rotateX: rotate.x,
            rotateY: rotate.y,
            boxShadow: isHovered
              ? "0 25px 50px -12px rgba(124, 58, 237, 0.5)"
              : "0 10px 30px -5px rgba(124, 58, 237, 0.3)",
          }}
          transition={{ type: "spring", stiffness: 100 }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Animated background patterns */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-white/20 transform translate-x-20 -translate-y-20"></div>
              <div className="absolute top-1/2 right-0 w-60 h-60 rounded-full bg-white/10 transform translate-x-1/3 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full bg-white/15 transform -translate-y-10"></div>
            </div>
          </div>

          {/* Card content */}
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="bg-white/90 p-2 rounded-full shadow-lg">
                  <Image src="/logo.png" alt="Vondera Logo" width={30} height={30} className="rounded-full" />
                </div>
                <span className="text-white/90 font-bold text-xl tracking-wide">vpay</span>
              </div>

              <div className="flex space-x-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <CreditCardIcon className="h-4 w-4 text-white" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center"
                >
                  <ShieldCheck className="h-4 w-4 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Chip */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-9 rounded-md bg-gradient-to-r from-yellow-300 to-yellow-500 flex items-center justify-center overflow-hidden">
                <div className="grid grid-cols-3 grid-rows-3 gap-px w-full h-full p-1">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="bg-yellow-600/30 rounded-sm"></div>
                  ))}
                </div>
              </div>
              <BadgeCheck className="h-5 w-5 text-yellow-300" />
            </div>

            {/* Balance */}
            <div className="flex justify-between items-end">
              <div>
                <p className="text-purple-100 text-xs mb-1 opacity-80">Total {type}</p>
                <div className="flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={balance}
                      className="text-white font-bold text-2xl"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      {Math.floor(balance).toLocaleString()} EGP
                    </motion.p>
                  </AnimatePresence>
                  <motion.div
                    className={`ml-2 text-xs font-medium ${isIncreasing ? "text-green-300" : "text-red-300"}`}
                    animate={{
                      y: [0, -5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 2,
                    }}
                  >
                    {isIncreasing ? "↑" : "↓"}
                  </motion.div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-xs mb-1 opacity-80">Total Balance</p>
                <p className="text-white font-bold text-xl">{Math.floor(totalBalance).toLocaleString()} EGP</p>
              </div>
            </div>
          </div>

          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-blue-400/20 z-5 mix-blend-overlay"></div>

          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 opacity-0 bg-gradient-to-r from-transparent via-white/20 to-transparent z-20"
            animate={{
              opacity: isHovered ? 0.5 : 0,
              left: isHovered ? "100%" : "-100%",
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

