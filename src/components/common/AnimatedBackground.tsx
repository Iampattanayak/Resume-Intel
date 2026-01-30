import { motion } from 'framer-motion';

export function AnimatedBackground() {
    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)' // Sky Blue Base
        }}>
            {/* Cloud 1: Sky Blue */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '60%',
                    height: '60%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, rgba(14, 165, 233, 0) 70%)',
                    filter: 'blur(80px)',
                }}
            />

            {/* Cloud 2: Blue */}
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 60, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 35,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '70%',
                    height: '70%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0) 70%)',
                    filter: 'blur(80px)',
                }}
            />

            {/* Cloud 3: Subtle Highlight */}
            <motion.div
                animate={{
                    x: [0, 50, -50, 0],
                    y: [0, 50, 50, 0],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5
                }}
                style={{
                    position: 'absolute',
                    top: '40%',
                    left: '40%',
                    width: '40%',
                    height: '40%',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(224, 242, 254, 0.2) 0%, rgba(224, 242, 254, 0) 70%)',
                    filter: 'blur(60px)',
                }}
            />
        </div>
    );
}
