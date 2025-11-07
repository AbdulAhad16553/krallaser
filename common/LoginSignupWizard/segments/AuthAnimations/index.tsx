'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, UserPlus, LogIn } from 'lucide-react'

interface AuthAnimationsProps {
    type: 'signup' | 'signin'
    show: boolean
    onComplete: () => void
}

const AuthAnimations = ({ type, show, onComplete }: AuthAnimationsProps) => {

    useEffect(() => {
        if (!show) return;

        const timer = setTimeout(() => {
            onComplete();
        }, 2000); // Ensure this matches your animation duration

        return () => clearTimeout(timer);
    }, [show, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white rounded-lg p-8 flex flex-col items-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                    >
                        <motion.div
                            className="text-green-500 mb-4"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        >
                            {type === 'signup' ? <UserPlus size={64} /> : <LogIn size={64} />}
                        </motion.div>
                        <motion.div
                            className="text-2xl font-bold mb-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            {type === 'signup' ? 'Account Created!' : 'Login Successful!'}
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AuthAnimations;
