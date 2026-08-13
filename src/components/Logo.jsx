import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

export default function Logo() {
  return (
    <motion.img
      src={logo}
      alt="Hacker House Goa 2026"
      className="hh-logo-img"
      width={140}
      height={140}
      whileHover={{ scale: 1.05, rotate: 4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    />
  )
}

